<script lang="ts">
	import { getVisibleRecipes } from '$data/recettes';
	import { RecipeBrowser } from '$lib/components';
	import { page } from '$app/stores';
	import content from '$lib/data/content';
	import { SITE_URL } from '$lib/config';

	const websiteJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Les recettes de Moumy',
		url: SITE_URL,
		description:
			"En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux"
	}).replace(/</g, '\\u003c');

	let data = $derived($page.data);
	let allRecipes = $derived(data.recipes ?? getVisibleRecipes());
</script>

<svelte:head>
	<title>Les recettes de Moumy</title>
	<meta
		name="description"
		content="En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux"
	/>
	<meta property="og:title" content="Les recettes de Moumy" />
	<meta
		property="og:description"
		content="En mémoire de Moumy, qui nous a transmis l'amour de la cuisine et ses secrets de famille précieux"
	/>
	<meta property="og:type" content="website" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags, @typescript-eslint/no-unused-expressions -- JSON is serialized and '<' escaped before insertion. -->
	{@html '<script type="application/ld+json">' + websiteJsonLd + '</script>'}
</svelte:head>

<div class="pattern-overlay"></div>

<!-- Hero -->
<header>
	<div class="relative overflow-hidden bg-surface-100-900">
		<div class="pointer-events-none absolute inset-0 opacity-10">
			<div
				class="absolute top-10 left-10 h-32 w-32 rounded-full blur-3xl"
				style="background: var(--color-gold)"
			></div>
			<div
				class="absolute right-10 bottom-10 h-48 w-48 rounded-full blur-3xl"
				style="background: var(--color-warm-brown)"
			></div>
		</div>

		<div class="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
			<p
				class="fade-in font-handwriting mb-4 text-2xl md:text-3xl"
				style="color: var(--color-gold)"
			>
				{content.landing.hero.subtitle}
			</p>
			<h1
				class="hero-title fade-in font-handwriting mb-6 text-5xl text-primary-700-300 md:text-7xl"
				style="animation-delay: 0.1s"
			>
				{content.landing.hero.title}
			</h1>
			<p
				class="fade-in font-title mx-auto max-w-2xl text-xl leading-relaxed text-primary-600-400 md:text-2xl"
				style="animation-delay: 0.2s"
			>
				{#if content.landing.hero.body}{@const HeroBody = content.landing.hero.body}<HeroBody
					/>{/if}
			</p>
			<div class="fade-in mt-8" style="animation-delay: 0.3s">
				<div class="inline-flex items-center gap-3 text-primary-400-600">
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/></svg
					>
					<span class="font-title text-lg">{content.landing.hero.badge}</span>
				</div>
			</div>
		</div>
	</div>
	<div class="h-16 bg-gradient-to-b from-surface-100-900 to-transparent"></div>
</header>

<!-- Quote -->
<section
	class="relative z-10 mx-auto max-w-4xl px-6"
	style="padding-top: var(--space-section); padding-bottom: var(--space-section)"
>
	<div class="quote-section slide-in bg-surface-100-900">
		<p class="font-handwriting mb-4 text-3xl leading-relaxed text-primary-700-300 md:text-4xl">
			{#if content.landing.quote.body}{@const QuoteBody = content.landing.quote.body}<QuoteBody
				/>{/if}
		</p>
		<p class="font-title text-lg text-primary-600-400 italic">
			{content.landing.quote.attribution}
		</p>
	</div>
</section>

<!-- Recipes -->
<main
	class="relative z-10 mx-auto max-w-6xl px-6"
	style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)"
>
	<RecipeBrowser recipes={allRecipes} />
</main>

<!-- Family Memories -->
<section
	class="relative z-10 bg-surface-100-900"
	style="padding-top: var(--space-section-lg); padding-bottom: var(--space-section-lg)"
>
	<div class="mx-auto max-w-4xl px-6 text-center">
		<h2 class="font-title mb-8 text-3xl text-primary-700-300 md:text-4xl">
			{content.landing.familyMemories.title}
		</h2>
		<p class="mb-8 leading-relaxed text-primary-600-400">
			{#if content.landing.familyMemories.body}{@const SouvenirsBody =
					content.landing.familyMemories.body}<SouvenirsBody />{/if}
		</p>
		<div class="mt-12 flex justify-center gap-8">
			<div class="text-center">
				<p class="font-handwriting text-5xl" style="color: var(--color-gold)">
					{allRecipes.length}
				</p>
				<p class="font-title text-primary-600-400">
					{content.landing.familyMemories.stats.recipes}
				</p>
			</div>
			<div class="text-center">
				<p class="font-handwriting text-5xl" style="color: var(--color-gold)">&infin;</p>
				<p class="font-title text-primary-600-400">
					{content.landing.familyMemories.stats.memories}
				</p>
			</div>
			<div class="text-center">
				<p class="font-handwriting text-5xl" style="color: var(--color-gold)">&hearts;</p>
				<p class="font-title text-primary-600-400">
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

	/* Mobile */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.25rem !important;
		}
	}
</style>
