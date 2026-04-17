import { getAllIngredients } from '$data/recettes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ingredients = Array.from(getAllIngredients().entries()).map(([name, recipes]) => ({
		name,
		recipes: recipes.map((r) => ({
			title: r.title,
			slug: r.slug,
			categoryDisplay: r.categoryDisplay
		}))
	}));
	return { ingredients };
};
