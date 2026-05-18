/**
 * Content loader — combines editorial content with UI labels.
 *
 * Editorial content: defined here as typed constants (mirrors src/data/content/*.md files).
 * UI labels: imported from src/data/content/ui.json.
 * Exports the same shape as the old content.json so existing components don't break.
 */

import ui from '../data/content/ui.json';

const content = {
	landing: {
		hero: {
			title: 'Les recettes de Moumy',
			subtitle: 'avec amour et souvenirs',
			description:
				"En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux.",
			badge: "Un héritage culinaire qui traverse les générations"
		},
		quote: {
			text: "La cuisine, c'est de l'amour qui se partage. Chaque plat raconte une histoire, chaque recette porte en elle des souvenirs précieux.",
			attribution: '— Moumy'
		},
		familyMemories: {
			title: 'Souvenirs de famille',
			text: "Chaque dimanche, Moumy préparait son célèbre poulet rôti. L'odeur remplissait la maison, attirant petits et grands vers la cuisine. Ces recettes ne sont pas seulement des instructions, ce sont des morceaux de notre histoire familiale, transmises avec amour de génération en génération.",
			stats: {
				recipes: 'Recettes préservées',
				memories: 'Souvenirs chéris',
				hearts: 'Toujours dans nos cœurs'
			}
		}
	},
	footer: {
		brand: 'Les recettes de Moumy',
		description: "Un hommage à Moumy, sa cuisine et tout l'amour qu'elle a mis dans chaque recette.",
		closing: 'Avec tout notre amour',
		copyright: 'Les recettes de Moumy — Un hommage familial'
	},
	nav: ui.nav,
	browser: ui.browser,
	recipeDetail: ui.recipeDetail
} as const;

export default content;
