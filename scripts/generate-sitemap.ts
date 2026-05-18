#!/usr/bin/env node
// ============================================================================
// Post-build script: generates sitemap.xml from recipe markdown files
//
// Reads frontmatter slugs from src/data/recettes/*.md, combines with static
// routes, and writes a sitemap.xml into the build output directory.
// ============================================================================

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SITE_URL = 'https://lesrecettesdemoumy.fr';

// Static routes that always exist
const STATIC_ROUTES = [
	'/',
	'/recettes',
	'/ingredients',
	'/documents',
	'/legal',
	'/privacy'
];

// Resolve paths relative to project root (CWD when run via npm/bun script)
const ROOT = process.cwd();
const RECIPES_DIR = join(ROOT, 'src', 'data', 'recettes');
const BUILD_DIR = join(ROOT, 'build');

/**
 * Extract slug from a recipe markdown filename.
 * Filename like "BrA147_A.md" → slug "BrA147_A"
 */
function slugFromFilename(filename: string): string {
	return filename.replace(/\.md$/, '');
}

/**
 * Get all recipe slugs by scanning the recettes directory.
 */
function getRecipeSlugs(): string[] {
	if (!existsSync(RECIPES_DIR)) {
		console.warn(`[sitemap] Warning: recipes directory not found at ${RECIPES_DIR}`);
		return [];
	}

	const files = readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.md'));
	return files.map(slugFromFilename).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Build the sitemap XML content.
 */
function buildSitemap(slugs: string[]): string {
	const today = new Date().toISOString().split('T')[0];

	const entries = [
		// Static routes — higher priority
		...STATIC_ROUTES.map(
			(route) =>
				`  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
		),
		// Dynamic recipe routes
		...slugs.map(
			(slug) =>
				`  <url>\n    <loc>${SITE_URL}/recettes/${encodeURIComponent(slug)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
		)
	];

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

// --- Main ---
const slugs = getRecipeSlugs();
console.log(`[sitemap] Found ${slugs.length} recipes`);

const sitemap = buildSitemap(slugs);

const outPath = join(BUILD_DIR, 'sitemap.xml');
writeFileSync(outPath, sitemap, 'utf-8');
console.log(`[sitemap] Written to ${outPath}`);
