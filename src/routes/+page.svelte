<script lang="ts">
	import { getAllRecipes, categories } from '$lib/data/recipes';
	import type { Recipe } from '$lib/data/recipes';
	import { Button, Badge, Card } from '$lib/components';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getAllRecipes());

	let searchQuery = $state('');
	let currentCategory = $state('all');
	let showFavorites = $state(false);
	let favorites = $state<string[]>(
		typeof window !== 'undefined'
			? JSON.parse(localStorage.getItem('moumy-favorites') || '[]')
			: []
	);

	let filteredRecipes = $derived.by(() => {
		let result = allRecipes;
		if (showFavorites) {
			result = result.filter((r) => favorites.includes(r.slug));
		} else if (currentCategory !== 'all') {
			result = result.filter((r) => r.category === currentCategory);
		}
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(r) =>
					r.title.toLowerCase().includes(q) ||
					r.excerpt.toLowerCase().includes(q) ||
					r.ingredients.some((i) => i.toLowerCase().includes(q))
			);
		}
		return result;
	});

	function toggleFavorite(slug: string) {
		const idx = favorites.indexOf(slug);
		if (idx > -1) favorites.splice(idx, 1);
		else favorites.push(slug);
		localStorage.setItem('moumy-favorites', JSON.stringify(favorites));
	}

	function randomRecipe() {
		const recipes = allRecipes;
		if (recipes.length === 0) return;
		const random = recipes[Math.floor(Math.random() * recipes.length)];
		goto('/recette/' + random.slug);
	}

	function setCategory(key: string) {
		showFavorites = false;
		currentCategory = key;
	}
</script>

<svelte:head>
	<title>Les recettes de Moumy</title>
	<meta name="description" content="En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux" />
</svelte:head>

<div class="pattern-overlay"></div>

<!-- Hero -->
<header class="hero-gradient relative overflow-hidden">
	<div class="absolute inset-0 opacity-10 pointer-events-none">
		<div class="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl" style="background: var(--color-gold)"></div>
		<div class="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl" style="background: var(--color-warm-brown)"></div>
	</div>

	<div class="max-w-6xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
		<p class="fade-in text-2xl md:text-3xl mb-4" style="font-family: var(--font-handwriting); color: var(--color-gold)">
			avec amour et souvenirs
		</p>
		<h1 class="hero-title fade-in text-5xl md:text-7xl mb-6" style="font-family: var(--font-handwriting); color: oklch(43% 0.055 52deg); animation-delay: 0.1s">
			Les recettes de Moumy
		</h1>
		<p class="fade-in text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed" style="font-family: var(--font-title); color: oklch(47% 0.04 56deg); animation-delay: 0.2s">
			En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux
		</p>
		<div class="mt-8 fade-in" style="animation-delay: 0.3s">
			<div class="inline-flex items-center gap-3" style="color: var(--color-warm-brown)">
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
				<span style="font-family: var(--font-title); font-size: 1.125rem">Un héritage culinaire qui traverse les générations</span>
			</div>
		</div>
	</div>

	<div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-cream)] to-transparent"></div>
</header>

<!-- Quote -->
<section class="max-w-4xl mx-auto px-6 relative z-10" style="padding-top: var(--space-section); padding-bottom: var(--space-section)">
	<div class="quote-section slide-in">
		<p class="text-3xl md:text-4xl leading-relaxed mb-4" style="font-family: var(--font-handwriting); color: oklch(43% 0.055 52deg)">
			"La cuisine, c'est de l'amour qui se partage. Chaque plat raconte une histoire, chaque recette porte en elle des souvenirs précieux."
		</p>
		<p class="text-lg italic" style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">— Moumy</p>
	</div>
</section>

<!-- Main -->
<main class="max-w-6xl mx-auto px-6 relative z-10" style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)">
	<!-- Search -->
	<div class="flex justify-center mb-10 no-print fade-in">
		<div class="w-full max-w-lg">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Rechercher une recette ou un ingrédient..."
				aria-label="Rechercher une recette"
				class="search-input"
			/>
		</div>
	</div>

	<!-- Category Filters -->
	<div class="flex flex-wrap justify-center gap-3 mb-8 no-print fade-in">
		{#each categories as cat}
			<Button
				variant={currentCategory === cat.key && !showFavorites ? 'primary' : 'outline'}
				size="sm"
				onclick={() => setCategory(cat.key)}
			>
				{cat.label}
			</Button>
		{/each}
	</div>

	<!-- Favorites + Random -->
	<div class="flex justify-center gap-3 mb-10 no-print fade-in">
		<Button
			variant={showFavorites ? 'primary' : 'outline'}
			size="sm"
			onclick={() => { showFavorites = true; currentCategory = 'all'; }}
		>
			<span class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
				Mes favoris
			</span>
		</Button>
		<Button variant="secondary" size="sm" onclick={randomRecipe}>
			<span class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
				Recette aléatoire
			</span>
		</Button>
		<a href="/ingredients">
			<Button variant="outline" size="sm">
				<span class="flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
					Index des ingrédients
				</span>
			</Button>
		</a>
	</div>

	<!-- Recipe Grid -->
	{#if filteredRecipes.length === 0}
		<div class="text-center py-16">
			<p class="text-2xl" style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">Aucune recette trouvée</p>
			<p class="mt-2" style="color: oklch(47% 0.04 56deg)">Essayez une autre recherche ou catégorie</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredRecipes as recipe, i}
				<article class="recipe-card fade-in" style="animation-delay: {i * 0.05}s">
					<a href="/recette/{recipe.slug}" class="block no-underline">
						<Card variant="elevated" noPadding>
							<div class="relative p-6">
								<button
									class="favorite-btn"
									class:active={favorites.includes(recipe.slug)}
									onclick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(recipe.slug); }}
									aria-label="Ajouter aux favoris"
								>
									<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
								</button>

								<Badge variant="gold" class="mb-3">{recipe.categoryLabel}</Badge>

								<h2 class="text-xl font-semibold leading-tight mb-2" style="font-family: var(--font-title); color: oklch(24% 0.035 52deg)">
									{recipe.title}
								</h2>
								<p class="text-sm leading-relaxed mb-3" style="color: oklch(47% 0.04 56deg)">{recipe.excerpt}</p>
								<div class="flex items-center gap-4 text-xs" style="color: oklch(65% 0.06 54deg)">
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
										{recipe.prepTime}
									</span>
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
										{recipe.servings}
									</span>
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
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
</main>

<!-- Family Memories -->
<section class="relative z-10 bg-gradient-to-br from-[var(--color-cream-dark)] to-[oklch(88%_0.03_68deg)]" style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)">
	<div class="max-w-4xl mx-auto px-6 text-center">
		<h2 class="text-3xl md:text-4xl mb-8" style="font-family: var(--font-title); color: oklch(43% 0.055 52deg)">Souvenirs de famille</h2>
		<p class="leading-relaxed mb-8" style="color: oklch(47% 0.04 56deg)">
			Chaque dimanche, Moumy préparait son célèbre poulet rôti. L'odeur remplissait la maison, attirant petits et grands vers la cuisine.
			Ces recettes ne sont pas seulement des instructions, ce sont des morceaux de notre histoire familiale, transmises avec amour de génération en génération.
		</p>
		<div class="flex justify-center gap-8 mt-12">
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">{allRecipes.length}</p>
				<p style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">Recettes préservées</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">&infin;</p>
				<p style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">Souvenirs chéris</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">&hearts;</p>
				<p style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">Toujours dans nos cœurs</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* Pattern overlay */
	.pattern-overlay {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F5C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	/* Hero gradient */
	.hero-gradient {
		background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 50%, oklch(88% 0.03 68deg) 100%);
		position: relative;
	}

	/* Recipe card gold bar on hover */
	.recipe-card :global(.card) {
		position: relative;
		overflow: hidden;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
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

	/* Favorite button */
	.favorite-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		background: white;
		border: 2px solid var(--color-cream-dark);
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10;
		opacity: 0;
		transform: scale(0.8);
		padding: 0;
	}

	.recipe-card:hover .favorite-btn {
		opacity: 1;
		transform: scale(1);
	}

	.favorite-btn.active {
		opacity: 1;
		transform: scale(1);
		background: var(--color-gold);
		border-color: var(--color-gold);
	}

	.favorite-btn svg {
		width: 18px;
		height: 18px;
		fill: none;
		stroke: oklch(47% 0.04 56deg);
		transition: all 0.3s ease;
	}

	.favorite-btn.active svg {
		fill: white;
		stroke: white;
	}

	.favorite-btn:hover svg {
		stroke: var(--color-gold);
		transform: scale(1.1);
	}

	/* Search input */
	.search-input {
		background: white;
		border: 2px solid var(--color-cream-dark);
		border-radius: 30px;
		padding: 14px 24px;
		font-family: var(--font-body);
		font-size: 1rem;
		width: 100%;
		transition: all 0.3s ease;
		color: oklch(24% 0.035 52deg);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-gold);
		box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
	}

	.search-input::placeholder {
		color: oklch(47% 0.04 56deg);
	}

	/* Quote section */
	.quote-section {
		background: linear-gradient(135deg, var(--color-cream-dark) 0%, oklch(88% 0.03 68deg) 100%);
		border-left: 4px solid var(--color-gold);
		padding: 32px;
		border-radius: 0 16px 16px 0;
		position: relative;
	}

	.quote-section::before {
		content: '\201C';
		position: absolute;
		top: -20px;
		left: 16px;
		font-size: 80px;
		color: var(--color-gold);
		opacity: 0.2;
		font-family: var(--font-title);
		line-height: 1;
	}

	/* Animations */
	.fade-in {
		animation: fadeIn 0.6s ease forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.slide-in {
		animation: slideIn 0.5s ease forwards;
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-20px); }
		to { opacity: 1; transform: translateX(0); }
	}

	/* Print */
	@media print {
		.no-print { display: none !important; }
	}

	/* Mobile */
	@media (max-width: 768px) {
		.hero-title { font-size: 2.25rem !important; }
		.search-input { font-size: 0.875rem; padding: 12px 20px; }
	}
</style>
