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
	<meta property="og:title" content="Nos recettes — Les recettes de Moumy" />
	<meta
		property="og:description"
		content="Découvrez toutes les recettes de Moumy, transmises avec amour de génération en génération."
	/>
</svelte:head>

<div class="pattern-overlay"></div>

<main
	class="relative z-10 mx-auto max-w-6xl px-6 pt-8"
	style="padding-bottom: var(--space-section-lg)"
>
	<h1 class="mb-8 text-center text-3xl text-primary-700-300 md:text-4xl">Nos recettes</h1>

	<RecipeBrowser recipes={allRecipes} />
</main>
