<script lang="ts">
	import { getVisibleRecipes } from '$data/recettes';
	import { RecipeBrowser } from '$lib/components';
	import { page } from '$app/stores';

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getVisibleRecipes());
</script>

<svelte:head>
	<title>Nos recettes — Les recettes de Moumy</title>
	<meta
		name="description"
		content="Découvrez toutes les recettes de Moumy, transmises avec amour de génération en génération."
	/>
</svelte:head>

<div class="pattern-overlay"></div>

<main
	class="max-w-6xl px-6 pt-8 relative z-10 mx-auto"
	style="padding-bottom: var(--space-section-lg)"
>
	<h1 class="text-3xl md:text-4xl mb-8 text-primary-700-300 text-center">Nos recettes</h1>

	<RecipeBrowser recipes={allRecipes} />
</main>

