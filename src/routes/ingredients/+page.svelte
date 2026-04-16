<script lang="ts">
	import type { PageData } from './$types';
	import LetterNav from './_components/LetterNav.svelte';
	import LetterSection from './_components/LetterSection.svelte';

	let { data }: { data: PageData } = $props();

	let expandedIngredient = $state<string | null>(null);

	let grouped = $derived.by(() => {
		const groups = new Map<string, typeof data.ingredients>();
		for (const ing of data.ingredients) {
			const letter = ing.name[0]?.toUpperCase() || '?';
			if (!groups.has(letter)) groups.set(letter, []);
			groups.get(letter)!.push(ing);
		}
		return groups;
	});

	let letters = $derived(Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'fr')));

	function toggleIngredient(name: string) {
		expandedIngredient = expandedIngredient === name ? null : name;
	}
</script>

<svelte:head>
	<title>Index des ingrédients — Les recettes de Moumy</title>
	<meta
		name="description"
		content="Parcourez toutes les recettes de Moumy par ingrédient. Retrouvez vos plats préférés grâce à notre index culinaire."
	/>
</svelte:head>

<div class="pattern-overlay"></div>

<main
	class="max-w-6xl px-6 pt-8 relative z-10 mx-auto"
	style="padding-bottom: var(--space-section-lg)"
>
	<h1 class="text-3xl md:text-4xl mb-8 text-primary-700-300 text-center">Index des ingrédients</h1>

	<LetterNav {letters} />

	{#each letters as letter, i}
		<LetterSection
			{letter}
			ingredients={grouped.get(letter)!}
			{expandedIngredient}
			onToggle={toggleIngredient}
			index={i}
		/>
	{/each}

	{#if data.ingredients.length === 0}
		<div class="py-16 text-center">
			<p class="text-2xl text-primary-600-400">Aucun ingrédient trouvé</p>
			<p class="mt-2 text-primary-600-400">Les recettes n'ont pas encore été ajoutées</p>
		</div>
	{/if}
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
