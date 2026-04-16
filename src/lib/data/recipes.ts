// ============================================================================
// Recipe Data Layer — mdsvex loader
//
// Recipes are stored as .md files in ./recipes/ with YAML frontmatter.
// mdsvex processes them at build time via import.meta.glob.
// ============================================================================

export interface RecipeMeta {
	title: string;
	slug: string;
	manuscript?: string;
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
 */
export function getAllRecipes(): Recipe[] {
	return Object.entries(recipeFiles)
		.map(([path, module]) => ({
			...module.metadata,
			slug: module.metadata.slug || path.match(/\/([^/]+)\.md$/)?.[1] || ''
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
 * Sorted alphabetically (French locale).
 */
export function getAllIngredients(): Map<string, Recipe[]> {
	const map = new Map<string, Recipe[]>();

	for (const recipe of getAllRecipes()) {
		for (const ing of recipe.ingredients) {
			// Normalize: lowercase, trim
			const key = normalizeIngredient(ing);
			if (!map.has(key)) {
				map.set(key, []);
			}
			map.get(key)!.push(recipe);
		}
	}

	// Sort by ingredient name (French alphabetical)
	return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr')));
}

/**
 * Normalize an ingredient string for search/comparison.
 * Removes quantities (e.g. "250g de farine" → "farine") for grouping,
 * but keeps the original for display.
 */
function normalizeIngredient(ing: string): string {
	return ing
		.toLowerCase()
		.replace(/^\d+[\d\s,.]*\s*(g|kg|ml|cl|l|cuillères?\s+(à\s+soupe|à\s+café)|poignée|pincée|bouquet|tranche|pièce|morceau)?\s*(d[e']?)?\s*/i, '')
		.trim();
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
