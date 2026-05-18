<script lang="ts">
	import { getCategories } from '$data/recettes';
	import type { Recipe } from '$data/recettes';
	import { Button, Badge, Card, SearchInput, EmptyState, LetterNav, RecipeCard } from '$lib/components';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import content from '$lib/data/content';

	interface Props {
		recipes: Recipe[];
	}

	let { recipes }: Props = $props();

	let categories = $derived(getCategories());

	// Read initial state from URL search params
	let searchQuery = $state(browser ? ($page.url.searchParams.get('q') ?? '') : '');
	let currentCategory = $state(browser ? ($page.url.searchParams.get('cat') ?? 'all') : 'all');

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

	// Easter egg: Star Wars prison recipe
	let easterEgg = $derived(/karat[eé]\s*de\s*prison/i.test(searchQuery));

	// Whether to show grouped (letter) view or flat grid
	let isGrouped = $derived(!searchQuery && currentCategory === 'all');

	// Group recipes by first letter of title
	let grouped = $derived.by(() => {
		const groups = new Map<string, Recipe[]>();
		for (const recipe of filteredRecipes) {
			const letter = recipe.title[0]?.toUpperCase() || '?';
			if (!groups.has(letter)) groups.set(letter, []);
			groups.get(letter)!.push(recipe);
		}
		return groups;
	});

	let letters = $derived(Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'fr')));


</script>

<div class="recipe-browser">
	<!-- Search -->
	<div class="mb-10 no-print flex justify-center">
		<div class="max-w-lg w-full">
			<SearchInput
				bind:value={searchQuery}
				placeholder={content.browser.searchPlaceholder}
				name="recipe-search"
			/>
		</div>
	</div>

	<!-- Category Filters -->
	<div class="gap-3 mb-8 no-print flex flex-wrap justify-center">
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
	<div class="gap-3 mb-10 no-print flex justify-center">
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
					{content.browser.ingredientIndex}
				</span>
			</Button>
		</a>
	</div>

	<!-- Alphabetical navigation (only in grouped mode) -->
	{#if isGrouped && letters.length > 0}
		<div class="no-print">
			<LetterNav {letters} />
		</div>
	{/if}

	<!-- Easter egg card -->
	{#if easterEgg}
		<div class="mb-10">
			<article class="easter-egg-card max-w-2xl mx-auto">
				<Card variant="elevated" noPadding>
					<div class="p-6 md:p-8">
						<!-- Header -->
						<Badge variant="gold" class="mb-3">Cuisine Carcérale</Badge>

						<h2 class="text-2xl leading-tight mb-2 text-primary-900-100 capitalize">
							Karaté de Prison
						</h2>
						<p class="text-sm leading-relaxed mb-6 text-surface-700-300 italic">
							Le repas idéal pour rester en forme dans une prison de la galaxie. Simple, efficace, et garanti pour te donner la force de tenir le coup.
						</p>

						<!-- Meta -->
						<div class="sm:grid-cols-4 gap-3 mb-8 grid grid-cols-2">
							<div class="gap-2 p-2 bg-surface-100-900 flex items-start rounded-[10px]">
								<svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								<div>
									<span class="text-surface-500 block text-[0.7rem] uppercase tracking-wide">Préparation</span>
									<span class="text-sm font-semibold">5 min (faut pas trainer, les gardes tournent)</span>
								</div>
							</div>
							<div class="gap-2 p-2 bg-surface-100-900 flex items-start rounded-[10px]">
								<svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
								<div>
									<span class="text-surface-500 block text-[0.7rem] uppercase tracking-wide">Cuisson</span>
									<span class="text-sm font-semibold">19 min</span>
								</div>
							</div>
							<div class="gap-2 p-2 bg-surface-100-900 flex items-start rounded-[10px]">
								<svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
								<div>
									<span class="text-surface-500 block text-[0.7rem] uppercase tracking-wide">Portions</span>
									<span class="text-sm font-semibold">1 détenu motivé</span>
								</div>
							</div>
							<div class="gap-2 p-2 bg-surface-100-900 flex items-start rounded-[10px]">
								<svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
								<div>
									<span class="text-surface-500 block text-[0.7rem] uppercase tracking-wide">Difficulté</span>
									<span class="text-sm font-semibold">Ceinture noire</span>
								</div>
							</div>
						</div>

						<!-- Ingredients -->
						<section class="pl-5 my-6 border-l-3" style="border-color: var(--color-gold)">
							<h3 class="gap-2 text-lg font-semibold mb-3 text-primary-700-300 flex items-center">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
								Ingrédients
							</h3>
							{#each [
								'Protéine de bantha en poudre',
								'Nouilles de cantine réchauffées 3 fois',
								'2 cuillères de sauce épicée de Tatooine',
								'1 poignée de riz de contrebande',
								'Sel de Kessel'
							] as ingredient}
								<div class="py-1.5 border-surface-200-800 hover:pl-2 flex items-start border-b transition-all duration-300 last:border-b-0">
									<span class="mr-3 font-bold text-lg shrink-0" style="color: var(--color-gold)">•</span>
									{ingredient}
								</div>
							{/each}
						</section>

						<!-- Preparation -->
						<section class="pl-5 my-6 border-l-3" style="border-color: var(--color-gold)">
							<h3 class="gap-2 text-lg font-semibold mb-3 text-primary-700-300 flex items-center">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
								Préparation
							</h3>
							<ol class="easter-steps">
							<li>Mélanger la protéine de bantha avec l'eau chaude du robinet de la cellule</li>
							<li>Réchauffer les nouilles sur le radiateur pendant la ronde du garde</li>
							<li>Ajouter la sauce épicée — la douleur renforce l'esprit</li>
							<li>Incorporer le riz de contrebande et le sel de Kessel</li>
							<li>Manger debout, en position de combat. On ne s'assoit jamais en prison.</li>
							</ol>
						</section>

						<!-- Moumy's note -->
						<div class="mt-6 p-5 rounded-xl text-xl sm:text-lg text-primary-700-300 bg-surface-100-900 relative" style="font-family: var(--font-handwriting); border: 2px dashed var(--color-gold)">
							<span class="top-1 left-2 text-4xl absolute leading-none opacity-30" style="color: var(--color-gold); font-family: var(--font-title)" aria-hidden="true">{'\u201C'}</span>
							<div class="gap-2 mb-2 text-sm font-semibold text-primary-700-300 flex items-center">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style="color: var(--color-gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
								<span>Notes de Moumy</span>
							</div>
							<p class="pl-4">Moumy te l'dit : un bon karatéka mange debout, dort peu, et ne laisse jamais une nouille dans son assiette. Surtout en prison.</p>
							<span class="bottom-1 right-2 text-4xl absolute leading-none opacity-30" style="color: var(--color-gold); font-family: var(--font-title)" aria-hidden="true">{'\u201D'}</span>
						</div>
					</div>
				</Card>
			</article>
		</div>
	{/if}

	<!-- Content -->
	{#if filteredRecipes.length === 0 && !easterEgg}
		<EmptyState
			icon="search"
			title={content.browser.emptyTitle}
			description={content.browser.emptyDescription}
		/>
	{:else if isGrouped}
		<!-- Grouped by letter -->
		{#each letters as letter, i}
			<section
				id="lettre-{letter}"
				class="mb-20 scroll-mt-8"
				style="animation-delay: {i * 0.05}s"
			>
				<div class="gap-4 mb-6 pb-3 border-secondary-300-700 flex items-center border-b-2">
					<span
						class="w-12 h-12 rounded-xl font-bold text-2xl from-secondary-400
							to-secondary-300 text-surface-950-50 max-md:w-10
							max-md:h-10 max-md:text-xl max-md:rounded-lg
							inline-flex shrink-0
							items-center justify-center bg-gradient-to-br font-[family-name:var(--font-title)]"
					>
						{letter}
					</span>
					<span class="text-sm text-primary-400-600 ml-auto">
						{grouped.get(letter)?.length ?? 0}
						recette{grouped.get(letter)?.length !== 1 ? 's' : ''}
					</span>
				</div>

				<div class="md:grid-cols-2 lg:grid-cols-3 gap-6 grid grid-cols-1">
					{#each grouped.get(letter) ?? [] as recipe, j}
						{@const delay = (i * 0.05 + j * 0.05).toFixed(2)}
						<div style="animation-delay: {delay}s">
							<RecipeCard {recipe} />
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:else}
		<!-- Flat grid (when searching or filtering by category) -->
		<div class="md:grid-cols-2 lg:grid-cols-3 gap-6 grid grid-cols-1">
			{#each filteredRecipes as recipe, i}
				<div class="fade-in" style="animation-delay: {i * 0.05}s">
					<RecipeCard {recipe} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Easter egg: numbered steps (mirrors recipe detail .recipe-body) */
	.easter-egg-card :global(.easter-steps) {
		list-style: none;
		counter-reset: easter-step;
		padding: 0;
		margin: 0;
	}

	.easter-egg-card :global(.easter-steps li) {
		counter-increment: easter-step;
		position: relative;
		padding-left: 3.25rem;
		margin-bottom: 1.25rem;
		line-height: 1.8;
	}

	.easter-egg-card :global(.easter-steps li)::before {
		content: counter(easter-step);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
		color: var(--color-surface-950);
		border-radius: 50%;
		font-family: var(--font-title);
		font-weight: 600;
		font-size: 0.875rem;
		position: absolute;
		left: 0;
		top: 2px;
	}

	.easter-egg-card :global(.easter-steps li:last-child) {
		margin-bottom: 0;
	}

	/* Easter egg glow */
	.easter-egg-card :global(.card) {
		border: 1px solid var(--color-gold);
		box-shadow:
			var(--shadow-card),
			0 0 20px oklch(0.8 0.1 85 / 0.3),
			0 0 60px oklch(0.8 0.1 85 / 0.1);
		animation: fadeIn 0.6s ease forwards, easterGlow 2s ease-in-out infinite alternate;
	}

	@keyframes easterGlow {
		from {
			box-shadow:
				var(--shadow-card),
				0 0 20px oklch(0.8 0.1 85 / 0.3),
				0 0 60px oklch(0.8 0.1 85 / 0.1);
		}
		to {
			box-shadow:
				var(--shadow-card),
				0 0 30px oklch(0.8 0.1 85 / 0.5),
				0 0 80px oklch(0.8 0.1 85 / 0.2);
		}
	}

	/* Print */
	@media print {
		.no-print {
			display: none !important;
		}
	}
</style>
