import { getAllRecipes } from '$lib/data/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		siteName: 'Moumy',
		recipes: getAllRecipes()
	};
};
