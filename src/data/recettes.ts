// ============================================================================
// Recipe Data Layer — mdsvex loader
//
// Recipes are stored as .md files in ./recipes/ with YAML frontmatter.
// mdsvex processes them at build time via import.meta.glob.
// ============================================================================

export interface RecipeMeta {
	title: string;
	category: string;
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
	/** Capitalized category for display */
	categoryDisplay: string;
}

// ---------------------------------------------------------------------------
// Loader — import.meta.glob reads all .md files eagerly at build time
// ---------------------------------------------------------------------------

const recipeFiles = import.meta.glob<{ metadata: RecipeMeta }>('./recettes/**/*.md', {
	eager: true
});

// Separate glob for body components (default exports from mdsvex)
const recipeBodies = import.meta.glob<{ default: any }>('./recettes/**/*.md', {
	eager: true
});

/** Capitalize first letter of a category for display */
function capitalize(s: string | undefined): string {
	if (!s) return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Get all recipes, sorted alphabetically by title.
 * Slug is derived from filename.
 */
export function getAllRecipes(): Recipe[] {
	return Object.entries(recipeFiles)
		.map(([path, module]) => {
		const meta = module?.metadata;
		if (!meta) return null; // skip files without valid frontmatter
		const raw = meta.category?.trim();
			if (!raw) return null; // skip recipes without a category
			const normalized = singularize(raw.toLowerCase());
			return {
				...meta,
				category: normalized,
				slug: path.match(/\/([^/]+)\.md$/)?.[1] || '',
				categoryDisplay: capitalize(normalized)
			};
		})
		.filter((r): r is Recipe => r !== null)
		.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}

/**
 * Get a single recipe by its slug.
 */
export function getRecipeBySlug(slug: string): Recipe | undefined {
	return getAllRecipes().find((r) => r.slug === slug);
}

/**
 * Get the mdsvex body component for a recipe by slug.
 */
export function getRecipeBody(slug: string): any {
	for (const [path, mod] of Object.entries(recipeBodies)) {
		if (path.endsWith(`/${slug}.md`)) {
			return mod.default;
		}
	}
	return null;
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
const ARTICLES = ['une', 'un', 'le', 'la', 'les'];

/** Descriptive adjectives to strip from the beginning (e.g. "gros oignons", "fines tranches") */
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
	'fin',
	'fine',
	'fins',
	'fines',
	'épais',
	'épaisse',
	'épaisses'
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
	'gousses',
	'sachet',
	'sachets',
	'verre',
	'verres'
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
	s = s.replace(rangeRe, '');
	s = s.replace(abbrevUnitsRe, '');
	s = s.replace(wordUnitsWithNumRe, '');
	s = s.replace(bareNumRe, '');
	s = s.replace(sizeAdjRe, '');
	s = s.replace(wordUnitsBareRe, '');

	// Normalize d'un/d'une contractions to 'de' to avoid article artifacts
	s = s.replace(/\bd'un(?:e)?\b/gi, 'de');
	// Strip any remaining standalone articles embedded in the middle
	s = s.replace(/\s+(?:un|une|le|la|les)\b/gi, '');

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

/**
 * Compound ingredient terms that must be treated as a single unit.
 * Key = normalized (singular) form used for grouping.
 * Value = array of regex patterns that match the compound after normalization.
 */
const COMPOUND_TERMS: [string, RegExp][] = [
	// Pâtes
	['pâte feuilletée', /\bpâte\s+feuillet/i],
	['pâte sablée', /\bpâte\s+sabl/i],
	['pâte brisée', /\bpâte\s+bris/i],
	['pâte à choux', /\bpâte\s+à\s+choux/i],
	// Crèmes
	['crème fraîche', /\bcrème\s+fraîch/i],
	['crème pâtissière', /\bcrème\s+pâtiss/i],
	['crème anglaise', /\bcrème\s+anglais/i],
	// Beurres
	['beurre demi-sel', /\bbeurre\s+demi\s*[-]?sel/i],
	['beurre salé', /\bbeurre\s+sal/i],
	['beurre doux', /\bbeurre\s+doux/i],
	// Laits
	['lait concentré', /\blait\s+concentr/i],
	['lait entier', /\blait\s+entier/i],
	['lait demi-écrémé', /\blait\s+demi\s*[-]?écrém/i],
	// Divers
	['marmelade d\'abricots', /\bmarmelade\s+d\s*[\'']?abricot/i],
	['gelée de groseille', /\bgelée\s+de\s+groseille/i],
	['sauce tomate', /\bsauce\s+tomate/i],
	['pomme de terre', /\bpomme\s+de\s+terre/i],
	['bouillon de volaille', /\bbouillon\s+de\s+volaille/i],
	['levure chimique', /\blevure\s+chimique/i],
	['sucre vanillé', /\bsucre\s+vanill/i],
	['sucre en poudre', /\bsucre\s+en\s+poudre/i],
	// Jus
	['jus de citron', /\bjus\b.*\bcitron/i],
	['jus d\'orange', /\bjus\b.*\borange/i]
];

/** Compound patterns where first word alone is NOT the ingredient */
const COMPOUND_PREFIXES = ['de'];

function getIngredientKey(ing: string): string {
	const normalized = normalizeIngredient(ing);
	if (!normalized) return '';

	// Check compound terms first — they take priority over single-word extraction
	for (const [key, pattern] of COMPOUND_TERMS) {
		if (pattern.test(normalized)) return key;
	}

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
// Categories — derived from recipe frontmatter
// ---------------------------------------------------------------------------

export interface Category {
	key: string;
	label: string;
	count: number;
}

/**
 * Get all unique categories from recipes, sorted alphabetically (French locale).
 * Label is the capitalized category value.
 */
export function getCategories(): Category[] {
	const map = new Map<string, number>();

	for (const recipe of getAllRecipes()) {
		const key = recipe.category;
		map.set(key, (map.get(key) ?? 0) + 1);
	}

	return [...map.entries()]
		.sort((a, b) => a[0].localeCompare(b[0], 'fr'))
		.map(([key, count]) => ({ key, label: capitalize(key), count }));
}

/**
 * Normalize a category string: lowercase + singularize.
 * Reused for search/filter matching.
 */
export function normalizeCategory(cat: string): string {
	if (!cat) return '';
	return singularize(cat.trim().toLowerCase());
}
