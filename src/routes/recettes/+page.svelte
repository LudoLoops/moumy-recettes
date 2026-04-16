<script lang="ts">
	import { getAllRecipes } from '$lib/data/recipes';
	import { RecipeBrowser } from '$lib/components';
	import { page } from '$app/stores';

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getAllRecipes());
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

<style>
	.pattern-overlay {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F5C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}
</style>
