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

	for (const htmlFile of htmlFiles) {
		const html = await readFile(htmlFile, 'utf8');
		const ogImages = getMetaContents(html, 'property', 'og:image');
		const twitterImages = getMetaContents(html, 'name', 'twitter:image');

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
