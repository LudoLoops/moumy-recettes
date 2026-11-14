import { afterAll, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import {
	mkdtemp,
	mkdir,
	readFile,
	readlink,
	readdir,
	rm,
	stat,
	symlink,
	writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAndPublish } from './preview-build';
import { buildPreview, fingerprintSources, getPreviewStatus } from './preview';
import { startPreviewServer, staticResponse } from './preview-server';

const temporaryDirectories: string[] = [];
const staticRoutes = ['/', '/recettes', '/ingredients', '/documents', '/legal', '/privacy'];

async function temporaryDirectory(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'moumy-preview-test-'));
	temporaryDirectories.push(directory);
	return directory;
}

async function addRecipes(root: string, slugs: string[]): Promise<void> {
	const recipes = join(root, 'src', 'data', 'recettes');
	await mkdir(recipes, { recursive: true });
	for (const slug of slugs) await writeFile(join(recipes, `${slug}.md`), `title: ${slug}`);
}

function sitemap(slugs: string[]): string {
	const routes = [...staticRoutes, ...slugs.map((slug) => `/recettes/${encodeURIComponent(slug)}`)];
	return `<urlset>${routes.map((route) => `<url><loc>https://lesrecettesdemoumy.fr${route}</loc></url>`).join('')}</urlset>`;
}

async function writeValidOutput(
	root: string,
	output: string,
	options: { omitPage?: string; omitImage?: boolean } = {}
): Promise<void> {
	const slugs = (await readdir(join(root, 'src', 'data', 'recettes')))
		.filter((name) => name.endsWith('.md'))
		.map((name) => name.slice(0, -3));
	await mkdir(join(output, 'recettes'), { recursive: true });
	await mkdir(join(output, 'assets'), { recursive: true });
	await mkdir(join(output, 'images'), { recursive: true });
	await writeFile(join(output, 'assets', 'site.css'), 'body { color: black }');
	if (!options.omitImage) await writeFile(join(output, 'images', 'scan.jpg'), 'image');
	await writeFile(join(output, 'sitemap.xml'), sitemap(slugs));

	const html = '<link rel="stylesheet" href="/assets/site.css"><img src="/images/scan.jpg">';
	for (const route of staticRoutes) {
		if (route === options.omitPage) continue;
		const path =
			route === '/' ? join(output, 'index.html') : join(output, `${route.slice(1)}.html`);
		await writeFile(path, `<html>${html}</html>`);
	}
	for (const slug of slugs) {
		const route = `/recettes/${slug}`;
		if (route === options.omitPage) continue;
		await writeFile(join(output, 'recettes', `${slug}.html`), `<html>${html}</html>`);
	}
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
		await addRecipes(root, ['cake']);
		const previewRoot = join(root, 'published');
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('missing');

		const manifest = await fingerprintSources(root);
		await mkdir(join(previewRoot, 'releases', 'first'), { recursive: true });
		await writeFile(
			join(previewRoot, 'releases', 'first', '.moumy-preview-manifest.json'),
			JSON.stringify(manifest)
		);
		await symlink('first', join(previewRoot, 'releases', 'current'), 'dir');
		await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: Updated cake');
		const latest = await fingerprintSources(root);
		await writeFile(
			join(previewRoot, 'releases', 'current', '.moumy-preview-manifest.json'),
			JSON.stringify(latest)
		);
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('fresh');
		await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: Changed again');
		expect((await getPreviewStatus(root, previewRoot)).status).toBe('stale');
	});
});

describe('preview publication validation', () => {
	test('rejects only-index/sitemap output and preserves the previous release on missing pages or assets', async () => {
		const root = await temporaryDirectory();
		await addRecipes(root, ['cake']);
		const previewRoot = join(await temporaryDirectory(), 'published');

		const onlyIndex = async (output: string) => {
			await writeFile(join(output, 'index.html'), '<h1>partial</h1>');
			await writeFile(join(output, 'sitemap.xml'), sitemap(['cake']));
		};
		await expect(buildAndPublish(root, previewRoot, onlyIndex)).rejects.toThrow(
			'missing page for route /recettes'
		);
		expect(await readlink(join(previewRoot, 'releases', 'current')).catch(() => null)).toBeNull();

		await buildAndPublish(root, previewRoot, (output) => writeValidOutput(root, output));
		const activeTarget = await readlink(join(previewRoot, 'releases', 'current'));
		const release = join(previewRoot, 'releases', activeTarget);
		expect((await stat(release)).mode & 0o777).toBe(0o750);
		expect((await stat(join(release, 'index.html'))).mode & 0o777).toBe(0o640);
		const activeHtml = await readFile(
			join(previewRoot, 'releases', 'current', 'index.html'),
			'utf8'
		);

		await addRecipes(root, ['tart']);
		await expect(
			buildAndPublish(root, previewRoot, (output) =>
				writeValidOutput(root, output, { omitPage: '/recettes/tart' })
			)
		).rejects.toThrow('missing recipe page for route /recettes/tart');
		expect(await readlink(join(previewRoot, 'releases', 'current'))).toBe(activeTarget);

		await expect(
			buildAndPublish(root, previewRoot, (output) =>
				writeValidOutput(root, output, { omitImage: true })
			)
		).rejects.toThrow('missing referenced asset /images/scan.jpg');
		expect(await readlink(join(previewRoot, 'releases', 'current'))).toBe(activeTarget);
		expect(await readFile(join(previewRoot, 'releases', 'current', 'index.html'), 'utf8')).toBe(
			activeHtml
		);
	});

	test('publishes added and removed recipe routes and retains the release on build/input failure', async () => {
		const root = await temporaryDirectory();
		await addRecipes(root, ['cake']);
		const previewRoot = join(await temporaryDirectory(), 'published');
		await buildAndPublish(root, previewRoot, (output) => writeValidOutput(root, output));

		await addRecipes(root, ['tart']);
		await buildAndPublish(root, previewRoot, (output) => writeValidOutput(root, output));
		expect(
			await readFile(join(previewRoot, 'releases', 'current', 'recettes', 'tart.html'), 'utf8')
		).toContain('<html>');

		await rm(join(root, 'src/data/recettes/cake.md'));
		await buildAndPublish(root, previewRoot, (output) => writeValidOutput(root, output));
		const currentTarget = await readlink(join(previewRoot, 'releases', 'current'));
		expect(
			await readFile(join(previewRoot, 'releases', 'current', 'sitemap.xml'), 'utf8')
		).not.toContain('/cake');
		expect(await readlink(join(previewRoot, 'releases', 'current'))).toBe(currentTarget);

		await writeFile(join(root, 'src/data/recettes/tart.md'), 'title: Edited');
		await expect(
			buildAndPublish(root, previewRoot, async (output) => {
				await writeValidOutput(root, output);
				await writeFile(join(root, 'src/data/recettes/tart.md'), 'title: changed during build');
			})
		).rejects.toThrow('Source files changed while building');
		expect(await readlink(join(previewRoot, 'releases', 'current'))).toBe(currentTarget);
		await expect(
			buildAndPublish(root, previewRoot, async () => {
				throw new Error('builder failed');
			})
		).rejects.toThrow('builder failed');
		expect(await readlink(join(previewRoot, 'releases', 'current'))).toBe(currentTarget);
	});
});

describe('kernel-managed build lock', () => {
	test('ignores stale lock files, serializes concurrent builds, and releases after the holder is killed', async () => {
		const root = await temporaryDirectory();
		await addRecipes(root, ['cake']);
		await writeFile(join(root, 'index.html'), '<h1>Fixture</h1>');
		const marker = join(root, 'build-starts');
		await writeFile(
			join(root, 'vite.config.ts'),
			`import { appendFile, mkdir, readdir, writeFile } from 'node:fs/promises';
export default {
  build: { outDir: process.env.MOUMY_PREVIEW_BUILD_DIR },
  plugins: [{
    name: 'preview-test-output',
    async closeBundle() {
      const out = process.env.MOUMY_PREVIEW_BUILD_DIR!;
      const marker = process.env.PREVIEW_TEST_MARKER!;
      await appendFile(marker, 'start\\n');
      const delay = Number(process.env.PREVIEW_TEST_DELAY ?? 0);
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      await mkdir(out + '/recettes', { recursive: true });
      await mkdir(out + '/assets', { recursive: true });
      await mkdir(out + '/images', { recursive: true });
      await writeFile(out + '/assets/site.css', 'body {}');
      await writeFile(out + '/images/scan.jpg', 'image');
      for (const route of ['recettes', 'ingredients', 'documents', 'legal', 'privacy']) await writeFile(out + '/' + route + '.html', '<html></html>');
      const slugs = (await readdir('src/data/recettes')).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3));
      for (const slug of slugs) await writeFile(out + '/recettes/' + slug + '.html', '<html><link rel="stylesheet" href="/assets/site.css"><img src="/images/scan.jpg"></html>');
    }
  }]
};`
		);
		const previewRoot = join(await temporaryDirectory(), 'published');
		await mkdir(previewRoot, { recursive: true });
		await writeFile(join(previewRoot, 'build.lock'), 'abandoned PID metadata is ignored');
		const oldMinimum = process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB;
		const oldMarker = process.env.PREVIEW_TEST_MARKER;
		const oldDelay = process.env.PREVIEW_TEST_DELAY;
		process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB = '0';
		process.env.PREVIEW_TEST_MARKER = marker;
		process.env.PREVIEW_TEST_DELAY = '800';
		try {
			const firstBuild = buildPreview(root, previewRoot);
			await waitForMarker(marker, 1);
			await expect(buildPreview(root, previewRoot)).rejects.toThrow('already running');
			await firstBuild;
			expect((await readFile(marker, 'utf8')).trim().split('\n')).toHaveLength(1);
			expect((await stat(join(previewRoot, 'build.lock'))).mode & 0o777).toBe(0o600);

			await writeFile(join(root, 'src/data/recettes/cake.md'), 'title: changed');
			const lockPath = join(previewRoot, 'build.lock');
			const workerPath = fileURLToPath(new URL('./preview-worker.ts', import.meta.url));
			const holder = spawn(
				'flock',
				[
					'--exclusive',
					'--nonblock',
					'--no-fork',
					'--conflict-exit-code',
					'75',
					lockPath,
					process.execPath,
					workerPath,
					root,
					previewRoot
				],
				{ cwd: root, stdio: 'ignore', env: process.env }
			);
			await waitForMarker(marker, 2);
			holder.kill('SIGKILL');
			await new Promise<void>((resolveExit) => holder.once('exit', () => resolveExit()));
			process.env.PREVIEW_TEST_DELAY = '0';
			await buildPreview(root, previewRoot);
			expect((await readFile(marker, 'utf8')).trim().split('\n')).toHaveLength(3);
		} finally {
			if (oldMinimum === undefined) delete process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB;
			else process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB = oldMinimum;
			if (oldMarker === undefined) delete process.env.PREVIEW_TEST_MARKER;
			else process.env.PREVIEW_TEST_MARKER = oldMarker;
			if (oldDelay === undefined) delete process.env.PREVIEW_TEST_DELAY;
			else process.env.PREVIEW_TEST_DELAY = oldDelay;
		}
	});
});

async function waitForMarker(path: string, expectedStarts: number): Promise<void> {
	const deadline = Date.now() + 10_000;
	while (Date.now() < deadline) {
		const marker = await readFile(path, 'utf8').catch(() => '');
		if (marker.trim().split('\n').filter(Boolean).length >= expectedStarts) return;
		await new Promise((resolveDelay) => setTimeout(resolveDelay, 25));
	}
	throw new Error(`Timed out waiting for ${expectedStarts} build start(s) in ${path}.`);
}

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
