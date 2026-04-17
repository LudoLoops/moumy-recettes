<script lang="ts">
	import { categories } from '$data/recettes';
	import type { Recipe } from '$data/recettes';
	import { Button, Badge, Card, SearchInput, EmptyState } from '$lib/components';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	interface Props {
		recipes: Recipe[];
	}

	let { recipes }: Props = $props();

	// Read initial state from URL search params
	let searchQuery = $state($page.url.searchParams.get('q') ?? '');
	let currentCategory = $state($page.url.searchParams.get('cat') ?? 'all');

	// Sync filter state → URL search params
	$effect(() => {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (currentCategory !== 'all') params.set('cat', currentCategory);
		const search = params.toString();
		const target = $page.url.pathname + (search ? '?' + search : '');
		if ($page.url.pathname + $page.url.search !== target) {
			goto(target, { replaceState: true, invalidateAll: false, noScroll: true });
		}
	});

	let filteredRecipes = $derived.by(() => {
		let result = recipes;
		if (currentCategory !== 'all') {
			result = result.filter((r) => r.category === currentCategory);
		}
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(r: Recipe) =>
					r.title.toLowerCase().includes(q) ||
					r.excerpt.toLowerCase().includes(q) ||
					r.ingredients.some((i: string) => i.toLowerCase().includes(q))
			);
		}
		return result;
	});

	function randomRecipe() {
		if (recipes.length === 0) return;
		const random = recipes[Math.floor(Math.random() * recipes.length)];
		goto('/recettes/' + random.slug);
	}
</script>

<div class="recipe-browser">
	<!-- Search -->
	<div class="mb-10 no-print fade-in flex justify-center">
		<div class="max-w-lg w-full">
			<SearchInput
				bind:value={searchQuery}
				placeholder="Rechercher une recette ou un ingrédient..."
				name="recipe-search"
			/>
		</div>
	</div>

	<!-- Category Filters -->
	<div class="gap-3 mb-8 no-print fade-in flex flex-wrap justify-center">
		{#each categories as cat}
			<Button
				variant={currentCategory === cat.key ? 'primary' : 'outline'}
				size="sm"
				onclick={() => {
					currentCategory = cat.key;
				}}
			>
				{cat.label}
			</Button>
		{/each}
	</div>

	<!-- Actions -->
	<div class="gap-3 mb-10 no-print fade-in flex justify-center">
		<Button variant="secondary" size="sm" onclick={randomRecipe}>
			<span class="gap-2 flex items-center">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/></svg
				>
				Recette aléatoire
			</span>
		</Button>
		<a href="/ingredients">
			<Button variant="outline" size="sm">
				<span class="gap-2 flex items-center">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/></svg
					>
					Index des ingrédients
				</span>
			</Button>
		</a>
	</div>

	<!-- Recipe Grid -->
	{#if filteredRecipes.length === 0}
		<EmptyState
			icon="search"
			title="Aucune recette trouvée"
			description="Essayez une autre recherche ou catégorie"
		/>
	{:else}
		<div class="md:grid-cols-2 lg:grid-cols-3 gap-6 grid grid-cols-1">
			{#each filteredRecipes as recipe, i}
				<article class="recipe-card fade-in" style="animation-delay: {i * 0.05}s">
					<a href="/recettes/{recipe.slug}" class="block no-underline">
						<Card variant="elevated" noPadding>
							<div class="p-6">
								<Badge variant="gold" class="mb-3">{recipe.categoryLabel}</Badge>

								<h2 class="text-xl font-semibold leading-tight mb-2 text-primary-900-100">
									{recipe.title}
								</h2>
								<p class="text-sm leading-relaxed mb-3 text-primary-600-400">
									{recipe.excerpt}
								</p>
								<div class="gap-4 text-xs text-primary-400-600 flex items-center">
									<span class="gap-1 flex items-center">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/></svg
										>
										{recipe.prepTime}
									</span>
									<span class="gap-1 flex items-center">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/></svg
										>
										{recipe.servings}
									</span>
									<span class="gap-1 flex items-center">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/></svg
										>
										{recipe.difficulty}
									</span>
								</div>
							</div>
						</Card>
					</a>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Recipe card gold bar on hover */
	.recipe-card :global(.card) {
		position: relative;
		overflow: hidden;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s ease;
	}

	.recipe-card:hover :global(.card) {
		transform: translateY(-6px);
		box-shadow: var(--shadow-hover);
	}

	.recipe-card :global(.card)::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 1;
	}

	.recipe-card:hover :global(.card)::before {
		opacity: 1;
	}

	/* Animations */
	.fade-in {
		animation: fadeIn 0.6s ease forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Print */
	@media print {
		.no-print {
			display: none !important;
		}
	}
</style>
