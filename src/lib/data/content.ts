/**
 * Content loader — mdsvex compiled, same pattern as recettes.ts
 *
 * Content .md files in src/data/content/ have YAML frontmatter + body.
 * mdsvex compiles them at build time:
 *   - metadata → frontmatter fields
 *   - default  → Svelte component for the body (supports **bold**, *italic*, etc.)
 *
 * UI labels come from src/data/content/ui.json.
 */

import ui from '../../data/content/ui.json';

// ---------------------------------------------------------------------------
// mdsvex loaders — same as recettes.ts
// ---------------------------------------------------------------------------

interface ContentMeta {
	title?: string;
	subtitle?: string;
	badge?: string;
	description?: string;
	attribution?: string;
	brand?: string;
	closing?: string;
	copyright?: string;
	stats?: Record<string, string>;
}

const contentModules = import.meta.glob<{ metadata: ContentMeta; default: any }>(
	'../../data/content/*.md',
	{ eager: true }
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function contentKey(path: string): string {
	return path.replace('../../data/content/', '').replace('.md', '');
}

// ---------------------------------------------------------------------------
// Build content object from mdsvex modules
// ---------------------------------------------------------------------------

const parsed: Record<string, { metadata: ContentMeta; body: any }> = {};
for (const [path, mod] of Object.entries(contentModules)) {
	parsed[contentKey(path)] = {
		metadata: mod?.metadata ?? {},
		body: mod?.default ?? null
	};
}

const hero = parsed['hero'] ?? { metadata: {}, body: null };
const quote = parsed['quote'] ?? { metadata: {}, body: null };
const souvenirs = parsed['souvenirs'] ?? { metadata: {}, body: null };
const footer = parsed['footer'] ?? { metadata: {}, body: null };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get the mdsvex body component for a content file by key (e.g. "hero", "quote") */
export function getContentBody(key: string): any {
	return parsed[key]?.body ?? null;
}

const content = {
	landing: {
		hero: {
			title: hero.metadata.title || '',
			subtitle: hero.metadata.subtitle || '',
			body: hero.body,
			badge: hero.metadata.badge || ''
		},
		quote: {
			body: quote.body,
			attribution: quote.metadata.attribution || ''
		},
		familyMemories: {
			title: souvenirs.metadata.title || '',
			body: souvenirs.body,
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
