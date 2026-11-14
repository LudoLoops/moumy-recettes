import { describe, expect, it } from 'vitest';
import {
	getAllIngredients,
	getAllRecipes,
	getCategories,
	getDocuments,
	getRecipeBody,
	getRecipeBySlug,
	getRecipeSteps,
	getVisibleRecipes,
	searchIngredients,
	searchRecipes
} from './recettes';
import { slugify } from '../lib/utils/slugify';

describe('recipe data', () => {
	it('loads recipes with unique filename-derived slugs in French title order', () => {
		const recipes = getAllRecipes();
		const titles = recipes.map((recipe) => recipe.title);

		expect(recipes.length).toBeGreaterThan(0);
		expect(new Set(recipes.map((recipe) => recipe.slug)).size).toBe(recipes.length);
		expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'fr')));
	});

	it('looks up recipe metadata, body, and numbered preparation steps by slug', () => {
		const recipe = getRecipeBySlug('BrA147_A');

		expect(recipe?.title).toBe("Gâteau à l'Orange");
		expect(recipe?.excerpt).toBe('');
		expect(getRecipeBody('BrA147_A')).toBeDefined();
		expect(getRecipeSteps('BrA147_A')[0]).toBe(
			'Mélanger en crème le beurre et la moitié du sucre.'
		);
	});

	it('keeps notebook documents out of recipe categories and visible recipes', () => {
		const documents = getDocuments();
		const visibleRecipes = getVisibleRecipes();
		const categories = getCategories();

		expect(documents.length).toBeGreaterThan(0);
		expect(visibleRecipes.every((recipe) => recipe.category !== 'document')).toBe(true);
		expect(categories.some((category) => category.key === 'document')).toBe(false);
		expect(categories.reduce((total, category) => total + category.count, 0)).toBe(
			visibleRecipes.length
		);
	});

	it('searches recipes and groups normalized ingredients', () => {
		const matches = searchRecipes('orange');
		const ingredients = getAllIngredients();
		const sugarRecipes = ingredients.get('sucre en poudre');
		const orangeIngredients = searchIngredients('oranges');

		expect(matches.some((recipe) => recipe.slug === 'BrA147_A')).toBe(true);
		expect(sugarRecipes?.some((recipe) => recipe.slug === 'BrA147_A')).toBe(true);
		expect(
			orangeIngredients.some((ingredient) =>
				ingredient.recipes.some((recipe) => recipe.slug === 'BrA147_A')
			)
		).toBe(true);
	});
});

describe('slugify', () => {
	it('normalizes accents and punctuation for stable URL slugs', () => {
		expect(slugify("Crème d'orange & petits gâteaux")).toBe('creme-d-orange-petits-gateaux');
	});
});
