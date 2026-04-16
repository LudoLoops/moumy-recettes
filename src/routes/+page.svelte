<script lang="ts">
	import { getAllRecipes } from '$lib/data/recipes';
	import { RecipeBrowser } from '$lib/components';
	import { page } from '$app/stores';

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getAllRecipes());
</script>

<svelte:head>
	<title>Les recettes de Moumy</title>
	<meta
		name="description"
		content="En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux"
	/>
</svelte:head>

<div class="pattern-overlay"></div>

<!-- Hero -->
<header>
	<div class="bg-surface-100-900 relative overflow-hidden">
		<div class="inset-0 pointer-events-none absolute opacity-10">
			<div
				class="top-10 left-10 w-32 h-32 blur-3xl absolute rounded-full"
				style="background: var(--color-gold)"
			></div>
			<div
				class="bottom-10 right-10 w-48 h-48 blur-3xl absolute rounded-full"
				style="background: var(--color-warm-brown)"
			></div>
		</div>

		<div class="max-w-6xl px-6 pt-24 pb-20 relative z-10 mx-auto text-center">
			<p
				class="fade-in text-2xl md:text-3xl mb-4"
				style="font-family: var(--font-handwriting); color: var(--color-gold)"
			>
				avec amour et souvenirs
			</p>
			<h1
				class="hero-title fade-in text-5xl md:text-7xl mb-6 text-primary-700-300"
				style="font-family: var(--font-handwriting); animation-delay: 0.1s"
			>
				Les recettes de Moumy
			</h1>
			<p
				class="fade-in text-xl md:text-2xl max-w-2xl leading-relaxed text-primary-600-400 mx-auto"
				style="font-family: var(--font-title); animation-delay: 0.2s"
			>
				En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille
				précieux
			</p>
			<div class="mt-8 fade-in" style="animation-delay: 0.3s">
				<div class="gap-3 text-primary-400-600 inline-flex items-center">
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/></svg
					>
					<span class="text-lg" style="font-family: var(--font-title)"
						>Un héritage culinaire qui traverse les générations</span
					>
				</div>
			</div>
		</div>
	</div>
	<div class="h-16 from-surface-100-900 bg-gradient-to-b to-transparent"></div>
</header>

<!-- Quote -->
<section
	class="max-w-4xl px-6 relative z-10 mx-auto"
	style="padding-top: var(--space-section); padding-bottom: var(--space-section)"
>
	<div class="quote-section slide-in bg-surface-100-900">
		<p
			class="text-3xl md:text-4xl leading-relaxed mb-4 text-primary-700-300"
			style="font-family: var(--font-handwriting)"
		>
			"La cuisine, c'est de l'amour qui se partage. Chaque plat raconte une histoire, chaque recette
			porte en elle des souvenirs précieux."
		</p>
		<p class="text-lg text-primary-600-400 italic" style="font-family: var(--font-title)">
			— Moumy
		</p>
	</div>
</section>

<!-- Recipes -->
<main
	class="max-w-6xl px-6 relative z-10 mx-auto"
	style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)"
>
	<RecipeBrowser recipes={allRecipes} />
</main>

<!-- Family Memories -->
<section
	class="bg-surface-100-900 relative z-10"
	style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)"
>
	<div class="max-w-4xl px-6 mx-auto text-center">
		<h2
			class="text-3xl md:text-4xl mb-8 text-primary-700-300"
			style="font-family: var(--font-title)"
		>
			Souvenirs de famille
		</h2>
		<p class="leading-relaxed mb-8 text-primary-600-400">
			Chaque dimanche, Moumy préparait son célèbre poulet rôti. L'odeur remplissait la maison,
			attirant petits et grands vers la cuisine. Ces recettes ne sont pas seulement des
			instructions, ce sont des morceaux de notre histoire familiale, transmises avec amour de
			génération en génération.
		</p>
		<div class="gap-8 mt-12 flex justify-center">
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					{allRecipes.length}
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">
					Recettes préservées
				</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					&infin;
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">Souvenirs chéris</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					&hearts;
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">
					Toujours dans nos cœurs
				</p>
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

	/* Quote section */
	.quote-section {
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
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.slide-in {
		animation: slideIn 0.5s ease forwards;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.25rem !important;
		}
	}
</style>
