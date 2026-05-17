<script lang="ts">
	import { getVisibleRecipes } from '$data/recettes';
	import { RecipeBrowser } from '$lib/components';
	import { page } from '$app/stores';
	import content from '$lib/data/content.json';

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getVisibleRecipes());
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
				{content.landing.hero.subtitle}
			</p>
			<h1
				class="hero-title fade-in text-5xl md:text-7xl mb-6 text-primary-700-300"
				style="font-family: var(--font-handwriting); animation-delay: 0.1s"
			>
				{content.landing.hero.title}
			</h1>
			<p
				class="fade-in text-xl md:text-2xl max-w-2xl leading-relaxed text-primary-600-400 mx-auto"
				style="font-family: var(--font-title); animation-delay: 0.2s"
			>
			{content.landing.hero.description}
			</p>
			<div class="mt-8 fade-in" style="animation-delay: 0.3s">
				<div class="gap-3 text-primary-400-600 inline-flex items-center">
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/></svg
					>
					<span class="text-lg" style="font-family: var(--font-title)"
						>{content.landing.hero.badge}</span
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
			"{content.landing.quote.text}"
		</p>
		<p class="text-lg text-primary-600-400 italic" style="font-family: var(--font-title)">
			{content.landing.quote.attribution}
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
			{content.landing.familyMemories.title}
		</h2>
		<p class="leading-relaxed mb-8 text-primary-600-400">
			{content.landing.familyMemories.text}
		</p>
		<div class="gap-8 mt-12 flex justify-center">
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					{allRecipes.length}
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">
					{content.landing.familyMemories.stats.recipes}
				</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					&infin;
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">{content.landing.familyMemories.stats.memories}</p>
			</div>
			<div class="text-center">
				<p class="text-5xl" style="font-family: var(--font-handwriting); color: var(--color-gold)">
					&hearts;
				</p>
				<p class="text-primary-600-400" style="font-family: var(--font-title)">
					{content.landing.familyMemories.stats.hearts}
				</p>
			</div>
		</div>
	</div>
</section>

<style>
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
