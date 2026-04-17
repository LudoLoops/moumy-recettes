// ============================================================================
// Recipe Data Layer — mdsvex loader
//
// Recipes are stored as .md files in ./recipes/ with YAML frontmatter.
// mdsvex processes them at build time via import.meta.glob.
// ============================================================================

export interface RecipeMeta {
	title: string;
	category: string;
	categoryLabel: string;
	excerpt: string;
	prepTime: string;
	cookTime: string;
	servings: string;
	difficulty: string;
	ingredients: string[];
	notes: string;
}

export interface Recipe extends RecipeMeta {
	/** Slug derived from filename */
	slug: string;
}

// ---------------------------------------------------------------------------
// Loader — import.meta.glob reads all .md files eagerly at build time
// ---------------------------------------------------------------------------

const recipeFiles = import.meta.glob<{ metadata: RecipeMeta }>('./recipes/*.md', {
	eager: true
});

/**
 * Get all recipes, sorted alphabetically by title.
 * Slug is derived from filename.
 */
export function getAllRecipes(): Recipe[] {
	return Object.entries(recipeFiles)
		.map(([path, module]) => ({
			...module.metadata,
			slug: path.match(/\/([^/]+)\.md$/)?.[1] || ''
		}))
		.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}

/**
 * Get a single recipe by its slug.
 */
export function getRecipeBySlug(slug: string): Recipe | undefined {
	return getAllRecipes().find((r) => r.slug === slug);
}

/**
 * Get all unique ingredients across all recipes, with the recipes that use each.
 * Groups by first word (singular), handles compounds like "pomme de terre".
 * Splits comma-separated and "et"-separated ingredient strings.
 * Sorted alphabetically (French locale).
 */
export function getAllIngredients(): Map<string, Recipe[]> {
	const map = new Map<string, Recipe[]>();

	for (const recipe of getAllRecipes()) {
		for (const ing of recipe.ingredients) {
			const cleaned = ing.replace(/\s*\([^)]*\)/g, '');
			const parts = cleaned.split(INGREDIENT_SEPARATORS);
			for (const part of parts) {
				const key = getIngredientKey(part.trim());
				if (!key) continue;
				if (!map.has(key)) map.set(key, []);
				if (!map.get(key)!.includes(recipe)) map.get(key)!.push(recipe);
			}
		}
	}

	return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr')));
}

// ---------------------------------------------------------------------------
// Ingredient normalization — configurable lists
// ---------------------------------------------------------------------------

/** Articles to strip from the beginning */
const ARTICLES = ['une', 'un'];

/** Size adjectives to strip from the beginning (e.g. "gros oignons" → "oignons") */
const SIZE_ADJECTIVES = [
	'petit',
	'petite',
	'petits',
	'petites',
	'gros',
	'grosse',
	'grands',
	'grand',
	'grandes',
	'gros',
	'grosse'
];

/** Abbreviated units that appear right after a number (no space needed) */
const ABBREV_UNITS = ['kg', 'ml', 'cl', 'g', 'l'];

/** Word units that can appear after a number */
const WORD_UNITS = [
	'litre',
	'litres',
	'cuillère',
	'cuillères',
	'cuillère à soupe',
	'cuillères à soupe',
	'cuillère à café',
	'cuillères à café',
	'poignée',
	'poignées',
	'pincée',
	'pincées',
	'bouquet garni',
	'bouquets garnis',
	'tranche',
	'tranches',
	'pièce',
	'pièces',
	'morceau',
	'morceaux',
	'gousse',
	'gousses'
];

/** Connectors that follow a unit (e.g. "de farine", "d'ail") */
const CONNECTORS = ['de', "d'"];

/** Separators that split compound ingredient lines into individual items */
const INGREDIENT_SEPARATORS = /,|\s+et\s+/i;

// Build regexes once from the lists
const abbrevUnitsRe = new RegExp(
	`^(?:(?:${ARTICLES.join('|')})\\s+)?(\\d+[\\d\\s,.]*)\\s*(?:${ABBREV_UNITS.map((u) => (u.length === 1 ? u + '\\b' : u)).join('|')})?\\s*(?:${CONNECTORS.map((c) => c.replace("'", "\\'")).join('|')})?\\s*`,
	'i'
);

const wordUnitsAlt = WORD_UNITS.map((u) => u.replace(/\s+/g, '\\s+')).join('|');
const wordUnitsWithNumRe = new RegExp(
	`^\\d+\\s*(?:${wordUnitsAlt})\\s*(?:${CONNECTORS.map((c) => c.replace("'", "\\'")).join('|')})?\\s*`,
	'i'
);

const wordUnitsBareRe = new RegExp(
	`^(?:${wordUnitsAlt})\\s*(?:${CONNECTORS.map((c) => c.replace("'", "\\'")).join('|')})\\s*`,
	'i'
);

const articlesRe = new RegExp(`^(${ARTICLES.join('|')})\\s+`, 'i');
const sizeAdjRe = new RegExp(`^(${SIZE_ADJECTIVES.join('|')})\\s+`, 'i');
const rangeRe = /^\d+\s*[-–]\s*\d+\s*/;
const bareNumRe = /^\d+\s+/;
const parensRe = /\s*\([^)]*\)/g;
const leadingDashRe = /^[-–—]\s*/;

function normalizeIngredient(ing: string): string {
	let s = ing.trim().toLowerCase();

	s = s.replace(parensRe, '');
	s = s.replace(leadingDashRe, '');
	s = s.replace(articlesRe, '');
	s = s.replace(sizeAdjRe, '');
	s = s.replace(rangeRe, '');
	s = s.replace(abbrevUnitsRe, '');
	s = s.replace(wordUnitsWithNumRe, '');
	s = s.replace(bareNumRe, '');
	s = s.replace(wordUnitsBareRe, '');

	return s.trim();
}

/** Plural endings → singular rules (ordered by specificity) */
const SINGULAR_RULES: [RegExp, string][] = [
	[/eaux$/, 'eau'],
	[/aux$/, 'al'],
	[/ss$/, '$&'],
	[/s$/, ''],
	[/(?:[^i])x$/, '']
];

function singularize(word: string): string {
	if (word.length < 2) return word;
	for (const [re, replacement] of SINGULAR_RULES) {
		if (re.test(word)) return word.replace(re, replacement);
	}
	return word;
}

/** Compound patterns where first word alone is NOT the ingredient */
const COMPOUND_PREFIXES = ['de'];

function getIngredientKey(ing: string): string {
	const normalized = normalizeIngredient(ing);
	const words = normalized.split(/\s+/);
	if (words.length === 0 || !words[0]) return '';

	const first = singularize(words[0]);

	if (words.length >= 3 && COMPOUND_PREFIXES.includes(words[1])) {
		return `${first} ${words[1]} ${words[2]}`;
	}

	return first;
}

/**
 * Search recipes by query string.
 * Matches against title, excerpt, and ingredients.
 */
export function searchRecipes(query: string): Recipe[] {
	if (!query) return getAllRecipes();
	const q = query.toLowerCase();
	return getAllRecipes().filter(
		(r) =>
			r.title.toLowerCase().includes(q) ||
			r.excerpt.toLowerCase().includes(q) ||
			r.ingredients.some((i) => i.toLowerCase().includes(q))
	);
}

/**
 * Search ingredients by query string.
 * Returns matching ingredient originals with their recipes.
 */
export function searchIngredients(query: string): { original: string; recipes: Recipe[] }[] {
	if (!query) return [];
	const q = query.toLowerCase();
	const results: { original: string; recipes: Recipe[] }[] = [];
	const seen = new Set<string>();

	for (const recipe of getAllRecipes()) {
		for (const ing of recipe.ingredients) {
			if (ing.toLowerCase().includes(q)) {
				const key = ing.toLowerCase();
				if (!seen.has(key)) {
					seen.add(key);
					results.push({ original: ing, recipes: [recipe] });
				} else {
					const existing = results.find((r) => r.original.toLowerCase() === key);
					if (existing && !existing.recipes.includes(recipe)) {
						existing.recipes.push(recipe);
					}
				}
			}
		}
	}

	return results.sort((a, b) => a.original.localeCompare(b.original, 'fr'));
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = [
	{ key: 'all', label: 'Toutes les recettes' },
	{ key: 'desserts', label: 'Desserts' },
	{ key: 'plats', label: 'Plats principaux' },
	{ key: 'soupes', label: 'Soupes' },
	{ key: 'pains', label: 'Pains' }
] as const;
