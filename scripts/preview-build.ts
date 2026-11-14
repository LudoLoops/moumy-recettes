import { randomUUID } from 'node:crypto';
import {
	chmod,
	mkdir,
	readdir,
	readFile,
	rename,
	rm,
	stat,
	symlink,
	writeFile
} from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fingerprintSources, getPreviewStatus } from './preview';

export const PREVIEW_MANIFEST_NAME = '.moumy-preview-manifest.json';
const STATIC_ROUTES = ['/', '/recettes', '/ingredients', '/documents', '/legal', '/privacy'];
const SITE_URL = 'https://lesrecettesdemoumy.fr';

function isWithin(parent: string, child: string): boolean {
	const path = relative(parent, child);
	return path === '' || (path !== '..' && !path.startsWith(`..${sep}`));
}

async function recipeSlugs(root: string): Promise<string[]> {
	const recipes = join(root, 'src', 'data', 'recettes');
	let entries;
	try {
		entries = await readdir(recipes, { withFileTypes: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw error;
	}
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
		.map((entry) => entry.name.slice(0, -3))
		.sort((a, b) => a.localeCompare(b, 'fr'));
}

function expectedRouteFile(output: string, route: string): string {
	if (route === '/') return join(output, 'index.html');
	const path = route.replace(/^\/+/, '');
	return join(output, `${path}.html`);
}

async function assertFile(path: string, label: string): Promise<void> {
	const info = await stat(path).catch(() => undefined);
	if (!info?.isFile() || info.size === 0)
		throw new Error(`Static build output is incomplete: ${label}`);
}

function localAssetUrls(html: string): string[] {
	const urls: string[] = [];
	for (const match of html.matchAll(
		/<(?:img|source|script)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
	)) {
		urls.push(match[1]);
	}
	for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
		if (!/\brel=["']stylesheet["']/i.test(match[0])) continue;
		const href = match[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
		if (href) urls.push(href);
	}
	return urls;
}

async function validateReferencedAssets(output: string): Promise<void> {
	const htmlFiles = await collectHtmlFiles(output);
	for (const htmlFile of htmlFiles) {
		const html = await readFile(htmlFile, 'utf8');
		const relativeHtml = relative(output, htmlFile).split(sep).join('/');
		const base = new URL(relativeHtml, 'http://preview.invalid/');
		for (const reference of localAssetUrls(html)) {
			const url = new URL(reference, base);
			if (url.origin !== 'http://preview.invalid') continue;
			const target = resolve(output, `.${decodeURIComponent(url.pathname)}`);
			if (!isWithin(output, target))
				throw new Error(`Unsafe local asset reference in ${relativeHtml}.`);
			await assertFile(target, `missing referenced asset ${url.pathname} in ${relativeHtml}.`);
		}
	}
}

async function grantGroupReadAccess(directory: string): Promise<void> {
	await chmod(directory, 0o2750);
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isSymbolicLink())
			throw new Error(`Static build output contains an unexpected symlink: ${path}`);
		if (entry.isDirectory()) await grantGroupReadAccess(path);
		else if (entry.isFile()) await chmod(path, 0o640);
		else throw new Error(`Static build output contains an unsupported file: ${path}`);
	}
}

async function collectHtmlFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await collectHtmlFiles(path)));
		else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
	}
	return files;
}

export async function validateBuildOutput(root: string, output: string): Promise<void> {
	await assertFile(join(output, 'index.html'), 'missing or empty index.html.');
	const sitemapPath = join(output, 'sitemap.xml');
	await assertFile(sitemapPath, 'missing or empty sitemap.xml.');
	const sitemap = await readFile(sitemapPath, 'utf8');
	const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
	const routes = new Set(
		urls.map((entry) => {
			const url = new URL(entry);
			if (url.origin !== SITE_URL) throw new Error(`Unexpected sitemap origin: ${url.origin}`);
			return decodeURIComponent(url.pathname);
		})
	);
	for (const route of STATIC_ROUTES) {
		if (!routes.has(route)) throw new Error(`Sitemap is missing required route ${route}.`);
		await assertFile(expectedRouteFile(output, route), `missing page for route ${route}.`);
	}

	const slugs = await recipeSlugs(root);
	const expectedRecipeRoutes = new Set(slugs.map((slug) => `/recettes/${slug}`));
	const actualRecipeRoutes = new Set([...routes].filter((route) => route.startsWith('/recettes/')));
	if (
		actualRecipeRoutes.size !== expectedRecipeRoutes.size ||
		[...expectedRecipeRoutes].some((route) => !actualRecipeRoutes.has(route))
	) {
		throw new Error('Sitemap recipe routes do not match the current source recipe filenames.');
	}
	for (const route of expectedRecipeRoutes) {
		await assertFile(expectedRouteFile(output, route), `missing recipe page for route ${route}.`);
	}
	await validateReferencedAssets(output);
}

export async function buildAndPublish(
	root: string,
	previewRoot: string,
	buildSite: (output: string) => Promise<void>
): Promise<{ status: 'fresh' | 'built'; builtAt: string; sourceFiles?: number }> {
	const status = await getPreviewStatus(root, previewRoot);
	if (status.status === 'fresh') {
		return { status: 'fresh', builtAt: status.builtAt ?? new Date().toISOString() };
	}

	const inputs = await fingerprintSources(root);
	const releaseId = `${Date.now()}-${randomUUID()}`;
	const staging = join(previewRoot, `.staging-${releaseId}`);
	const output = join(staging, 'site');
	const release = join(previewRoot, 'releases', releaseId);
	let releasePublished = false;
	let nextLink: string | undefined;
	try {
		await mkdir(previewRoot, { recursive: true, mode: 0o750 });
		await mkdir(staging, { mode: 0o2700 });
		await mkdir(output, { mode: 0o2700 });
		console.log(
			`PREVIEW_STATE ${JSON.stringify({ status: 'building', totalInputs: inputs.sourceFiles })}`
		);
		await buildSite(output);
		await validateBuildOutput(root, output);
		await grantGroupReadAccess(output);
		const builtSources = await fingerprintSources(root);
		if (builtSources.fingerprint !== inputs.fingerprint) {
			throw new Error(
				'Source files changed while building; preview was not published. Run Preview again.'
			);
		}

		const manifest = { ...builtSources, generatedAt: new Date().toISOString() };
		await writeFile(join(output, PREVIEW_MANIFEST_NAME), JSON.stringify(manifest, null, 2), {
			mode: 0o640
		});
		const releasesDirectory = join(previewRoot, 'releases');
		await mkdir(releasesDirectory, { recursive: true, mode: 0o2750 });
		await chmod(releasesDirectory, 0o2750);
		await rename(output, release);
		nextLink = join(releasesDirectory, `.current-${releaseId}`);
		await symlink(relative(releasesDirectory, release), nextLink, 'dir');
		await rename(nextLink, join(releasesDirectory, 'current'));
		releasePublished = true;
		return { status: 'built', builtAt: manifest.generatedAt, sourceFiles: manifest.sourceFiles };
	} finally {
		await rm(staging, { recursive: true, force: true });
		if (!releasePublished) {
			if (nextLink) await rm(nextLink, { force: true });
			await rm(release, { recursive: true, force: true });
		}
	}
}
