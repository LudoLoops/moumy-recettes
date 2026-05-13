import { getVisibleRecipes } from '$data/recettes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		siteName: 'Moumy',
		recipes: getVisibleRecipes()
	};
};
