<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components';

	let { data }: { data: PageData } = $props();

	// Track which ingredient is expanded
	let expandedIngredient = $state<string | null>(null);

	// Group ingredients by first letter
	let grouped = $derived.by(() => {
		const groups = new Map<string, typeof data.ingredients>();
		for (const ing of data.ingredients) {
			const letter = ing.name[0]?.toUpperCase() || '?';
			if (!groups.has(letter)) groups.set(letter, []);
			groups.get(letter)!.push(ing);
		}
		return groups;
	});

	// Alphabetically sorted letter keys
	let letters = $derived(Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'fr')));

	function toggleIngredient(name: string) {
		expandedIngredient = expandedIngredient === name ? null : name;
	}
</script>

<svelte:head>
	<title>Index des ingrédients — Les recettes de Moumy</title>
	<meta name="description" content="Parcourez toutes les recettes de Moumy par ingrédient. Retrouvez vos plats préférés grâce à notre index culinaire." />
</svelte:head>

<div class="pattern-overlay"></div>

<!-- Hero -->
<header class="hero-gradient relative overflow-hidden">
	<div class="absolute inset-0 opacity-10 pointer-events-none">
		<div class="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl" style="background: var(--color-gold)"></div>
		<div class="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl" style="background: var(--color-warm-brown)"></div>
	</div>

	<div class="max-w-6xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
		<!-- Back link -->
		<a href="/" class="back-link fade-in inline-flex items-center gap-2 mb-8">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Retour aux recettes
		</a>

		<p class="fade-in text-2xl md:text-3xl mb-4" style="font-family: var(--font-handwriting); color: var(--color-gold)">
			parcourir par
		</p>
		<h1 class="hero-title fade-in text-5xl md:text-7xl mb-6" style="font-family: var(--font-title); color: oklch(43% 0.055 52deg); animation-delay: 0.1s">
			Index des ingrédients
		</h1>
		<p class="fade-in text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed" style="font-family: var(--font-body); color: oklch(47% 0.04 56deg); animation-delay: 0.2s">
			Trouvez la recette parfaite en parcourant les ingrédients que Moumy aimait utiliser
		</p>
		<div class="mt-6 fade-in" style="animation-delay: 0.3s">
			<span class="inline-flex items-center gap-2 text-lg" style="font-family: var(--font-body); color: var(--color-warm-brown)">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
				{data.ingredients.length} ingrédients — {data.ingredients.reduce((sum, i) => sum + i.recipes.length, 0)} recettes
			</span>
		</div>
	</div>

	<div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-cream)] to-transparent"></div>
</header>

<!-- Letter Jump Nav -->
<nav class="letter-nav max-w-6xl mx-auto px-6 py-6" aria-label="Navigation alphabétique">
	<ul class="flex flex-wrap justify-center gap-2">
		{#each letters as letter}
			<li>
				<a
					href="#lettre-{letter}"
					class="letter-link"
					aria-label="Aller à la lettre {letter}"
				>
					{letter}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<!-- Ingredient Groups -->
<main class="max-w-6xl mx-auto px-6 relative z-10" style="padding-bottom: var(--space-section-lg)">
	{#each letters as letter, groupIndex}
		{@const ingredientsForLetter = grouped.get(letter)!}
		<section
			id="lettre-{letter}"
			class="letter-section fade-in"
			style="animation-delay: {groupIndex * 0.05}s"
		>
			<div class="letter-header">
				<span class="letter-badge">{letter}</span>
				<h2 class="letter-title">{letter}</h2>
				<span class="letter-count">{ingredientsForLetter.length} ingrédient{ingredientsForLetter.length > 1 ? 's' : ''}</span>
			</div>

			<div class="ingredient-grid">
				{#each ingredientsForLetter as ingredient}
					<div class="ingredient-card" class:expanded={expandedIngredient === ingredient.name}>
						<button
							class="ingredient-trigger"
							onclick={() => toggleIngredient(ingredient.name)}
							aria-expanded={expandedIngredient === ingredient.name}
						>
							<span class="ingredient-name">{ingredient.name}</span>
							<span class="ingredient-count">
								{ingredient.recipes.length} recette{ingredient.recipes.length > 1 ? 's' : ''}
								<svg class="chevron" class:rotated={expandedIngredient === ingredient.name} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</span>
						</button>

						{#if expandedIngredient === ingredient.name}
							<div class="ingredient-recipes">
								{#each ingredient.recipes as recipe}
									<a href="/recette/{recipe.slug}" class="recipe-link">
										<span class="recipe-link-title">{recipe.title}</span>
										<Badge variant="gold">{recipe.categoryLabel}</Badge>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}

	{#if data.ingredients.length === 0}
		<div class="text-center py-16">
			<p class="text-2xl" style="font-family: var(--font-title); color: oklch(47% 0.04 56deg)">Aucun ingrédient trouvé</p>
			<p class="mt-2" style="color: oklch(47% 0.04 56deg)">Les recettes n'ont pas encore été ajoutées</p>
		</div>
	{/if}
</main>

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

	/* Back link */
	.back-link {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-warm-brown);
		text-decoration: none;
		transition: all 0.3s ease;
		border-bottom: 1px solid transparent;
		padding-bottom: 2px;
	}

	.back-link:hover {
		color: var(--color-gold-dark);
		border-bottom-color: var(--color-gold);
	}

	/* Letter navigation */
	.letter-nav {
		position: relative;
		z-index: 1;
		border-bottom: 1px solid rgba(139, 111, 92, 0.1);
	}

	.letter-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		font-family: var(--font-title);
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-warm-brown);
		text-decoration: none;
		transition: all 0.3s ease;
		background: white;
		border: 1px solid rgba(139, 111, 92, 0.12);
	}

	.letter-link:hover {
		background: var(--color-gold);
		color: oklch(24% 0.035 52deg);
		border-color: var(--color-gold);
		transform: translateY(-2px);
		box-shadow: var(--shadow-card);
	}

	/* Letter sections */
	.letter-section {
		margin-bottom: var(--space-section);
		scroll-margin-top: 2rem;
	}

	.letter-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid rgba(201, 169, 98, 0.2);
	}

	.letter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
		color: oklch(24% 0.035 52deg);
		border-radius: 12px;
		font-family: var(--font-title);
		font-weight: 700;
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.letter-title {
		font-family: var(--font-title);
		font-size: 1.75rem;
		font-weight: 600;
		color: oklch(43% 0.055 52deg);
		margin: 0;
	}

	.letter-count {
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-warm-brown-light);
		margin-left: auto;
	}

	/* Ingredient grid */
	.ingredient-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 0.75rem;
	}

	/* Ingredient card */
	.ingredient-card {
		background: white;
		border-radius: 0.75rem;
		border: 1px solid rgba(139, 111, 92, 0.1);
		box-shadow: var(--shadow-card);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.ingredient-card:hover {
		border-color: rgba(201, 169, 98, 0.3);
		box-shadow: var(--shadow-hover);
	}

	.ingredient-card.expanded {
		border-color: var(--color-gold);
		box-shadow: var(--shadow-hover);
	}

	/* Trigger button */
	.ingredient-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 1rem 1.25rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		transition: background 0.2s ease;
		gap: 0.75rem;
	}

	.ingredient-trigger:hover {
		background: var(--color-cream);
	}

	.ingredient-name {
		font-family: var(--font-body);
		font-size: 1.0625rem;
		color: oklch(24% 0.035 52deg);
		font-weight: 500;
		text-transform: capitalize;
	}

	.ingredient-count {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-warm-brown-light);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.chevron {
		width: 16px;
		height: 16px;
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	/* Expanded recipe list */
	.ingredient-recipes {
		border-top: 1px solid rgba(139, 111, 92, 0.1);
		padding: 0.5rem 0;
		animation: expandDown 0.25s ease forwards;
	}

	@keyframes expandDown {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 500px;
		}
	}

	/* Recipe link inside expanded card */
	.recipe-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		text-decoration: none;
		transition: all 0.2s ease;
		border-left: 3px solid transparent;
	}

	.recipe-link:hover {
		background: var(--color-cream);
		border-left-color: var(--color-gold);
		padding-left: 1.5rem;
	}

	.recipe-link-title {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: oklch(24% 0.035 52deg);
		font-weight: 500;
		line-height: 1.4;
	}

	.recipe-link:hover .recipe-link-title {
		color: var(--color-warm-brown);
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

	/* Mobile */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.25rem !important;
		}

		.letter-header {
			gap: 0.75rem;
		}

		.letter-badge {
			width: 40px;
			height: 40px;
			font-size: 1.25rem;
			border-radius: 8px;
		}

		.letter-title {
			font-size: 1.375rem;
		}

		.ingredient-grid {
			grid-template-columns: 1fr;
		}

		.letter-link {
			width: 32px;
			height: 32px;
			font-size: 0.75rem;
		}

		.ingredient-trigger {
			padding: 0.875rem 1rem;
		}

		.recipe-link {
			padding: 0.625rem 1rem;
			flex-wrap: wrap;
		}
	}
</style>
