import { getRecipeBySlug, getAllRecipes } from '$data/recettes';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipe = getRecipeBySlug(params.slug);
	if (!recipe) throw error(404, 'Recette introuvable');
	return { recipe };
};

export const entries: EntryGenerator = async () => {
	return getAllRecipes().map((r) => ({ slug: r.slug }));
};
