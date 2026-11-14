import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	buildPreview,
	fingerprintSources,
	getPreviewStatus,
	startPreviewServer,
	staticResponse
} from './preview';

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'moumy-preview-test-'));
	temporaryDirectories.push(directory);
	return directory;
}

afterAll(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true }))
	);
});

describe('preview source fingerprint', () => {
	test('detects additions, modifications, and deletions in recipes, images, copy and code', async () => {
		const root = await temporaryDirectory();
		for (const directory of [
			'src/data/recettes',
			'src/data/img',
			'src/data/content',
			'src/routes',
			'static'
		]) {
			await mkdir(join(root, directory), { recursive: true });
		}
		await writeFile(join(root, 'src/data/recettes/existing.md'), 'title: First');
		await writeFile(join(root, 'src/data/img/scan.jpg'), 'image-v1');
		await writeFile(join(root, 'src/data/content/hero.md'), 'Hero v1');
		await writeFile(join(root, 'src/routes/+page.svelte'), '<h1>Page</h1>');
		await writeFile(join(root, 'static/robots.txt'), 'User-agent: *');
		await writeFile(join(root, '.env.local'), 'PUBLIC_SITE_LABEL=initial');

		const initial = await fingerprintSources(root);
		await writeFile(join(root, '.env.local'), 'PUBLIC_SITE_LABEL=changed');
		expect((await fingerprintSources(root)).fingerprint).not.toBe(initial.fingerprint);
		const withEnvironment = await fingerprintSources(root);
		await writeFile(join(root, 'src/data/recettes/new.md'), 'title: New');
		expect((await fingerprintSources(root)).fingerprint).not.toBe(withEnvironment.fingerprint);
		const withNewRecipe = await fingerprintSources(root);

		await writeFile(join(root, 'src/data/img/scan.jpg'), 'image-v2');
		expect((await fingerprintSources(root)).fingerprint).not.toBe(withNewRecipe.fingerprint);
		const withNewImage = await fingerprintSources(root);

		await writeFile(join(root, 'src/data/content/hero.md'), 'Hero v2');
		expect((await fingerprintSources(root)).fingerprint).not.toBe(withNewImage.fingerprint);
		const withNewEditorial = await fingerprintSources(root);

		await rm(join(root, 'src/data/recettes/new.md'));
		expect((await fingerprintSources(root)).fingerprint).not.toBe(withNewEditorial.fingerprint);
	});

	test('reports a missing preview, then fresh and stale manifests', async () => {
		const root = await temporaryDirectory();
		await mkdir(join(root, 'src/data/recettes'), { recursive: true });
		await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: Cake');
		const previewRoot = join(root, 'published');
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('missing');

		const manifest = await fingerprintSources(root);
		await mkdir(join(previewRoot, 'releases', 'first'), { recursive: true });
		await writeFile(
			join(previewRoot, 'releases', 'first', '.moumy-preview-manifest.json'),
			JSON.stringify(manifest)
		);
		await symlink('releases/first', join(previewRoot, 'current'), 'dir');
		await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: Updated cake');
		const latest = await fingerprintSources(root);
		await writeFile(
			join(previewRoot, 'current', '.moumy-preview-manifest.json'),
			JSON.stringify(latest)
		);
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('fresh');
		await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: Changed again');
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('stale');
	});

	test('keeps the previous publication when the next build fails', async () => {
		const root = await temporaryDirectory();
		const previewRoot = await temporaryDirectory();
		await mkdir(join(root, 'src'), { recursive: true });
		await mkdir(join(root, 'scripts'), { recursive: true });
		await writeFile(
			join(root, 'package.json'),
			'{"scripts":{"build":"bun scripts/fake-build.ts"}}'
		);
		await writeFile(
			join(root, 'scripts/fake-build.ts'),
			`import { mkdir, writeFile } from 'node:fs/promises';
if (process.env.PREVIEW_TEST_FAIL === '1') process.exit(1);
const out = process.env.MOUMY_PREVIEW_BUILD_DIR!;
await mkdir(out, { recursive: true });
await writeFile(out + '/index.html', '<h1>Current test preview</h1>');
if (process.env.PREVIEW_TEST_INVALID !== '1') await writeFile(out + '/sitemap.xml', '<urlset></urlset>');
if (process.env.PREVIEW_TEST_MUTATE === '1') await writeFile('src/changed-during-build.ts', 'export {};');
`
		);

		const oldMinimum = process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB;
		process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB = '0';
		try {
			await buildPreview(root, previewRoot);
			const oldTarget = await readlink(join(previewRoot, 'current'));
			const oldHtml = await readFile(join(previewRoot, 'current', 'index.html'), 'utf8');
			await writeFile(join(root, 'src/new-page.ts'), 'export const changed = true;');
			const lockPath = join(previewRoot, 'build.lock');
			await writeFile(lockPath, JSON.stringify({ pid: process.pid }));
			await expect(buildPreview(root, previewRoot)).rejects.toThrow('already running');
			await rm(lockPath);

			process.env.PREVIEW_TEST_MUTATE = '1';
			await expect(buildPreview(root, previewRoot)).rejects.toThrow(
				'Source files changed while building'
			);
			delete process.env.PREVIEW_TEST_MUTATE;
			expect(await readlink(join(previewRoot, 'current'))).toBe(oldTarget);
			expect(await readFile(join(previewRoot, 'current', 'index.html'), 'utf8')).toBe(oldHtml);

			process.env.PREVIEW_TEST_INVALID = '1';
			await expect(buildPreview(root, previewRoot)).rejects.toThrow('output is incomplete');
			delete process.env.PREVIEW_TEST_INVALID;
			expect(await readlink(join(previewRoot, 'current'))).toBe(oldTarget);

			process.env.PREVIEW_TEST_FAIL = '1';
			await expect(buildPreview(root, previewRoot)).rejects.toThrow('failed with exit code');
			expect(await readlink(join(previewRoot, 'current'))).toBe(oldTarget);
			expect(await readFile(join(previewRoot, 'current', 'index.html'), 'utf8')).toBe(oldHtml);
		} finally {
			delete process.env.PREVIEW_TEST_FAIL;
			delete process.env.PREVIEW_TEST_MUTATE;
			delete process.env.PREVIEW_TEST_INVALID;
			if (oldMinimum === undefined) delete process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB;
			else process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB = oldMinimum;
		}
	});
});

describe('static preview server', () => {
	test('serves clean URLs, static files and HEAD without exposing the build manifest', async () => {
		const root = await temporaryDirectory();
		await mkdir(join(root, 'recettes'), { recursive: true });
		await writeFile(join(root, 'index.html'), '<h1>Home</h1>');
		await writeFile(join(root, 'recettes', 'cake.html'), '<h1>Gâteau</h1>');
		await writeFile(join(root, 'robots.txt'), 'User-agent: *');
		await writeFile(join(root, '.moumy-preview-manifest.json'), '{"secret":"not public"}');

		const page = await staticResponse(new Request('http://preview.test/recettes/cake'), root);
		expect(page.status).toBe(200);
		expect(await page.text()).toContain('Gâteau');
		expect(page.headers.get('cache-control')).toBe('no-store');

		const home = await staticResponse(new Request('http://preview.test/'), root);
		expect(await home.text()).toContain('Home');
		const head = await staticResponse(
			new Request('http://preview.test/robots.txt', { method: 'HEAD' }),
			root
		);
		expect(head.status).toBe(200);
		expect(await head.text()).toBe('');
		expect(
			(await staticResponse(new Request('http://preview.test/.moumy-preview-manifest.json'), root))
				.status
		).toBe(404);
	});

	test('rejects methods, malformed escapes, traversal and non-loopback binds', async () => {
		const root = await temporaryDirectory();
		await writeFile(join(root, 'index.html'), 'home');
		expect(
			(await staticResponse(new Request('http://preview.test/', { method: 'POST' }), root)).status
		).toBe(405);
		expect((await staticResponse(new Request('http://preview.test/%E0%A4%A'), root)).status).toBe(
			400
		);
		expect(
			(await staticResponse(new Request('http://preview.test/%2e%2e/etc/passwd'), root)).status
		).toBe(404);
		expect(() => startPreviewServer(root, '0.0.0.0', 0)).toThrow('must bind to loopback');
		expect(() => startPreviewServer(root, 'localhost', 0)).toThrow('must bind to loopback');
	});
});
