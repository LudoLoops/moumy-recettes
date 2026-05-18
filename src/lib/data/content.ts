/**
 * Content loader — loads editorial content from src/data/content/*.md files.
 *
 * Each .md file has YAML frontmatter + body text, loaded via import.meta.glob at build time.
 * UI labels come from src/data/content/ui.json.
 * Hot-reloads in dev when files change.
 */

import ui from '../../data/content/ui.json';

// Import raw markdown content (frontmatter + body)
const rawModules = import.meta.glob<string>('../../data/content/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/**
 * Extract YAML frontmatter and body from raw markdown.
 * Returns { metadata, body } where metadata is a simple object.
 */
function parseMd(raw: string): { metadata: Record<string, any>; body: string } {
	const parts = raw.split('---');
	if (parts.length < 3) return { metadata: {}, body: raw.trim() };

	const yaml = parts[1].trim();
	const body = parts.slice(2).join('---').trim();

	// Simple YAML parser for flat + one-level nested
	const metadata: Record<string, any> = {};
	let currentKey = '';
	const nested: Record<string, string> = {};
	let inNested = false;

	for (const line of yaml.split('\n')) {
		// Nested line (2 spaces indent)
		const nestedMatch = line.match(/^\s{2}(\w+):\s*"?(.+?)"?\s*$/);
		if (nestedMatch && inNested) {
			nested[nestedMatch[1]] = nestedMatch[2];
			continue;
		}

		// Top-level key: value
		const match = line.match(/^(\w+):\s*(.*)$/);
		if (match) {
			if (inNested && currentKey) {
				metadata[currentKey] = { ...nested };
				for (const k of Object.keys(nested)) delete nested[k];
				inNested = false;
			}

			currentKey = match[1];
			let val: string = match[2].trim();
			// Remove surrounding quotes
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
			if (val === '') {
				inNested = true;
			} else {
				metadata[currentKey] = val;
			}
		}
	}
	// Save last nested
	if (inNested && currentKey) {
		metadata[currentKey] = { ...nested };
	}

	return { metadata, body };
}

/**
 * Build key from file path.
 * e.g. "../../data/content/landing/hero.md" → "landing/hero"
 */
function contentKey(path: string): string {
	return path.replace('../../data/content/', '').replace('.md', '');
}

// Parse all .md files
const parsed: Record<string, { metadata: Record<string, any>; body: string }> = {};
for (const [path, raw] of Object.entries(rawModules)) {
	parsed[contentKey(path)] = parseMd(raw as string);
}

// Build the content object matching the old shape
const hero = parsed['hero'] || { metadata: {}, body: '' };
const quote = parsed['quote'] || { metadata: {}, body: '' };
const souvenirs = parsed['souvenirs'] || { metadata: {}, body: '' };
const footer = parsed['footer'] || { metadata: {}, body: '' };

const content = {
	landing: {
		hero: {
			title: hero.metadata.title || '',
			subtitle: hero.metadata.subtitle || '',
			description: hero.body || hero.metadata.description || '',
			badge: hero.metadata.badge || ''
		},
		quote: {
			text: quote.body || '',
			attribution: quote.metadata.attribution || ''
		},
		familyMemories: {
			title: souvenirs.metadata.title || '',
			text: souvenirs.body || '',
			stats: souvenirs.metadata.stats || {}
		}
	},
	footer: {
		brand: footer.metadata.brand || '',
		description: footer.metadata.description || '',
		closing: footer.metadata.closing || '',
		copyright: footer.metadata.copyright || ''
	},
	nav: ui.nav,
	browser: ui.browser,
	recipeDetail: ui.recipeDetail
} as const;

export default content;
