import { expect, test } from 'bun:test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OG_IMAGE_URL, SITE_URL } from '../src/lib/config';

const buildDirectory = fileURLToPath(new URL('../build/', import.meta.url));
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function findHtmlFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) return findHtmlFiles(path);
			return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
		})
	);
	return files.flat();
}

function getMetaContents(html: string, attribute: 'name' | 'property', key: string): string[] {
	const tags = html.match(/<meta\b[^>]*>/g) ?? [];
	return tags
		.filter((candidate) => candidate.includes(`${attribute}="${key}"`))
		.map((tag) => tag.match(/\bcontent="([^"]*)"/)?.[1] ?? '');
}

test('static pages have usable social images and large-image Twitter cards', async () => {
	const png = await readFile(join(buildDirectory, 'og-image.png'));
	expect(png.subarray(0, 8)).toEqual(pngSignature);
	expect(png.readUInt32BE(16)).toBe(1200);
	expect(png.readUInt32BE(20)).toBe(630);

	const htmlFiles = await findHtmlFiles(buildDirectory);
	expect(htmlFiles.length).toBeGreaterThan(0);

	const sitemap = await readFile(join(buildDirectory, 'sitemap.xml'), 'utf8');
	const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
	expect(sitemapUrls.length).toBeGreaterThan(0);
	for (const sitemapUrl of sitemapUrls) expect(new URL(sitemapUrl).origin).toBe(SITE_URL);
	const robots = await readFile(join(buildDirectory, 'robots.txt'), 'utf8');
	expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
	expect(robots).not.toContain('lesrecettesdemoumy.fr');

	for (const htmlFile of htmlFiles) {
		const html = await readFile(htmlFile, 'utf8');
		const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"[^>]*>/)?.[1];
		const ogUrls = getMetaContents(html, 'property', 'og:url');
		expect(canonical, `${htmlFile} has a canonical URL`).toBeTruthy();
		expect(new URL(canonical!).origin).toBe(SITE_URL);
		expect(ogUrls, `${htmlFile} has exactly one Open Graph URL`).toHaveLength(1);
		expect(new URL(ogUrls[0]!).origin).toBe(SITE_URL);

		const ogImages = getMetaContents(html, 'property', 'og:image');
		const twitterImages = getMetaContents(html, 'name', 'twitter:image');
		const jsonLdScripts = [
			...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
		];
		for (const [, payload] of jsonLdScripts) {
			const structuredData = JSON.parse(payload!) as { image?: string | string[] };
			if (structuredData.image) {
				for (const image of Array.isArray(structuredData.image)
					? structuredData.image
					: [structuredData.image]) {
					const url = new URL(image);
					expect(url.origin).toBe(SITE_URL);
					const imagePath = join(
						buildDirectory,
						decodeURIComponent(url.pathname).replace(/^\/+/, '')
					);
					expect(await Bun.file(imagePath).exists(), `${htmlFile} references ${url.pathname}`).toBe(
						true
					);
				}
			}
		}

		expect(ogImages, `${htmlFile} has exactly one Open Graph image`).toHaveLength(1);
		expect(twitterImages, `${htmlFile} has exactly one Twitter image`).toHaveLength(1);
		expect(getMetaContents(html, 'name', 'twitter:card')).toEqual(['summary_large_image']);

		for (const imageUrl of [ogImages[0]!, twitterImages[0]!]) {
			const url = new URL(imageUrl);
			expect(url.origin).toBe(SITE_URL);
			expect(url.pathname).not.toBe('/favicon.png');
			const imagePath = join(buildDirectory, decodeURIComponent(url.pathname).replace(/^\/+/, ''));
			expect(await Bun.file(imagePath).exists(), `${htmlFile} references ${url.pathname}`).toBe(
				true
			);
		}
	}

	const homepage = await readFile(join(buildDirectory, 'index.html'), 'utf8');
	expect(getMetaContents(homepage, 'property', 'og:image')).toEqual([OG_IMAGE_URL]);
	expect(getMetaContents(homepage, 'name', 'twitter:image')).toEqual([OG_IMAGE_URL]);
});
