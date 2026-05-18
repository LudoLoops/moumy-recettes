<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Button } from '$lib/components';
	import { getRecipeBody } from '$data/recettes';
	import ManuscriptImage from '$lib/components/ManuscriptImage.svelte';
	import { goto } from '$app/navigation';
	import content from '$lib/data/content';

	let { data }: { data: PageData } = $props();
	const recipe = $derived(data.recipe);

	const bodyComponent = $derived(getRecipeBody(recipe.slug));

	// Second ingredients list: title + items (both optional)
	const hasIngredients2 = $derived(
		Array.isArray(recipe.ingredients2) && recipe.ingredients2.length > 0
	);
	const ingredients2Title = $derived(recipe.ingredients2Title || '');
	const ingredients2List = $derived(recipe.ingredients2 ?? []);

	function handlePrint() {
		window.print();
	}

	async function handleShare() {
		const shareData = {
			title: recipe.title,
			text: recipe.notes,
			url: window.location.href
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch {
				// user cancelled
			}
		} else {
			await navigator.clipboard.writeText(window.location.href);
		}
	}

	function handleBack() {
		try {
			const ref = document.referrer;
			if (ref) {
				const refUrl = new URL(ref);
				if (refUrl.origin === window.location.origin && refUrl.pathname === '/') {
					// Came from landing page → go to /recettes with any filters
					const params = refUrl.searchParams.toString();
					goto('/recettes' + (params ? '?' + params : ''));
					return;
				}
			}
		} catch {
			// Invalid referrer, ignore
		}
		// Default: normal history back (preserves /recettes filters)
		history.back();
	}
</script>

{#snippet title()}
	<Badge variant="gold">{recipe.categoryDisplay}</Badge>

	<h1 class="text-4xl md:text-[2.75rem] leading-tight mt-4 mb-2 capitalize">
		{recipe.title}
	</h1>

	<p
		class="text-lg leading-relaxed mb-6 text-surface-700-300 italic font-handwriting"
	>
		{recipe.excerpt}
	</p>

	{#if recipe.legende}
		<p class="mb-6 text-xl leading-relaxed text-primary-500-400 italic">
			{recipe.legende}
		</p>
	{/if}
	<!-- Snippet here -->
{/snippet}

<svelte:head>
	<title>{recipe.title} — Les recettes de Moumy</title>
	<meta name="description" content={recipe.excerpt} />
	<meta property="og:title" content="{recipe.title} — Les recettes de Moumy" />
	<meta property="og:description" content={recipe.excerpt} />
	<meta property="og:type" content="article" />
</svelte:head>

<div
	class="inset-0 pointer-events-none fixed z-0"
	style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F5C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)"
></div>

<div
	class="max-w-6xl px-4 md:px-6 pt-4 relative z-10 mx-auto"
	style="padding-bottom: var(--space-section-lg)"
>
	<!-- Back link -->
	<Button variant="ghost" size="sm" onclick={handleBack} class="no-print">
		<span class="gap-1 flex items-center">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{content.recipeDetail.back}
		</span>
	</Button>

	<!-- Two-column grid -->
	<div class="md:grid-cols-[1fr_2fr] gap-8 md:gap-12 mt-6 md:mt-8 grid grid-cols-1">
		<div class="md:hidden">
			{@render title()}
		</div>
		<!-- Left: Manuscript image (sticky on desktop) -->
		<div>
			<ManuscriptImage {recipe} />
		</div>

		<!-- Right: Recipe content -->
		<div>
			<div class="md:block hidden">
				{@render title()}
			</div>
			<!-- Meta info grid -->
			<div class="sm:grid-cols-4 gap-4 mb-8 grid grid-cols-2">
				<div
					class="gap-2.5 p-3 hover:border-gold sm:p-2 bg-surface-100-900 border-surface-200-800 flex items-start rounded-[10px] border transition-all duration-300 hover:-translate-y-px"
				>
					<svg
						class="w-5 h-5 mt-0.5 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style="color: var(--color-gold)"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<span class="tracking-wide mb-0.5 text-surface-500 block text-[0.7rem] uppercase"
							>{content.recipeDetail.meta.prepTime}</span
						>
						<span class="text-sm font-semibold block">{recipe.prepTime}</span>
					</div>
				</div>

				<div
					class="gap-2.5 p-3 hover:border-gold sm:p-2 bg-surface-100-900 border-surface-200-800 flex items-start rounded-[10px] border transition-all duration-300 hover:-translate-y-px"
				>
					<svg
						class="w-5 h-5 mt-0.5 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style="color: var(--color-gold)"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
						/>
					</svg>
					<div>
						<span class="tracking-wide mb-0.5 text-surface-500 block text-[0.7rem] uppercase"
							>{content.recipeDetail.meta.cookTime}</span
						>
						<span class="text-sm font-semibold block">{recipe.cookTime}</span>
					</div>
				</div>

				<div
					class="gap-2.5 p-3 hover:border-gold sm:p-2 bg-surface-100-900 border-surface-200-800 flex items-start rounded-[10px] border transition-all duration-300 hover:-translate-y-px"
				>
					<svg
						class="w-5 h-5 mt-0.5 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style="color: var(--color-gold)"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<div>
						<span class="tracking-wide mb-0.5 text-surface-500 block text-[0.7rem] uppercase"
							>{content.recipeDetail.meta.servings}</span
						>
						<span class="text-sm font-semibold block">{recipe.servings}</span>
					</div>
				</div>

				<div
					class="gap-2.5 p-3 hover:border-gold sm:p-2 bg-surface-100-900 border-surface-200-800 flex items-start rounded-[10px] border transition-all duration-300 hover:-translate-y-px"
				>
					<svg
						class="w-5 h-5 mt-0.5 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style="color: var(--color-gold)"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
					<div>
						<span class="tracking-wide mb-0.5 text-surface-500 block text-[0.7rem] uppercase"
							>{content.recipeDetail.meta.difficulty}</span
						>
						<span class="text-sm font-semibold block">{recipe.difficulty}</span>
					</div>
				</div>
			</div>

			<!-- Ingredients -->
			<div class="my-8" style="break-inside: avoid">
				{#if hasIngredients2}
					<!-- Two-column layout: ingredients side by side on desktop -->
					<div class="md:grid-cols-2 gap-6 grid grid-cols-1">
						<!-- Main ingredients list -->
						<section class="pl-5 border-l-3" style="border-color: var(--color-gold)">
							<h2 class="gap-2 text-xl font-semibold mb-4 text-primary-700-300 flex items-center">
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									style="color: var(--color-gold)"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								{content.recipeDetail.sections.ingredients}
							</h2>
							{#each recipe.ingredients as ingredient (ingredient)}
								<div
									class="py-2 border-surface-200-800 leading-normal hover:pl-2 flex items-start border-b transition-all duration-300 last:border-b-0"
								>
									<span class="mr-3 font-bold text-xl shrink-0" style="color: var(--color-gold)"
										>•</span
									>
									{ingredient}
								</div>
							{/each}
						</section>

						<!-- Second ingredients list (title + items) -->
						<section class="pl-5 border-l-3" style="border-color: var(--color-gold)">
							<h2 class="gap-2 text-xl font-semibold mb-4 text-primary-700-300 flex items-center">
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									style="color: var(--color-gold)"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								{ingredients2Title || content.recipeDetail.sections.ingredients2Fallback}
							</h2>
							{#each ingredients2List as ingredient (ingredient)}
								<div
									class="py-2 border-surface-200-800 leading-normal hover:pl-2 flex items-start border-b transition-all duration-300 last:border-b-0"
								>
									<span class="mr-3 font-bold text-xl shrink-0" style="color: var(--color-gold)"
										>•</span
									>
									{ingredient}
								</div>
							{/each}
						</section>
					</div>
				{:else}
					<!-- Single ingredients list (no ingredients2) -->
					<section class="pl-5 border-l-3" style="border-color: var(--color-gold)">
						<h2 class="gap-2 text-xl font-semibold mb-4 text-primary-700-300 flex items-center">
							<svg
								class="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								style="color: var(--color-gold)"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							{content.recipeDetail.sections.ingredients}
						</h2>
						{#each recipe.ingredients as ingredient (ingredient)}
							<div
								class="py-2 border-surface-200-800 leading-normal hover:pl-2 flex items-start border-b transition-all duration-300 last:border-b-0"
							>
								<span class="mr-3 font-bold text-xl shrink-0" style="color: var(--color-gold)"
									>•</span
								>
								{ingredient}
							</div>
						{/each}
					</section>
				{/if}
			</div>

			<!-- Preparation steps (body from mdsvex) -->
			<section
				class="pl-5 my-8 border-l-3"
				style="border-color: var(--color-gold); break-inside: avoid"
			>
				<h2 class="gap-2 text-xl font-semibold mb-4 text-primary-700-300 flex items-center">
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style="color: var(--color-gold)"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
					{content.recipeDetail.sections.preparation}
				</h2>
				<div class="recipe-body leading-loose font-body">
					{#if bodyComponent}
						{@const Body = bodyComponent}
						<Body />
					{/if}
				</div>
			</section>

			<!-- Moumy's notes -->
			{#if recipe.notes}
				<div
					class="mt-8 p-6 rounded-xl leading-relaxed text-2xl sm:text-xl text-primary-700-300 bg-surface-100-900 relative font-handwriting"
					style="border: 2px dashed var(--color-gold)"
				>
					<span
						class="top-2 left-3 text-5xl absolute leading-none opacity-30 font-title"
						style="color: var(--color-gold)"
						aria-hidden="true"
					>
						{'\u201C'}
					</span>
					<div class="gap-2 mb-3 text-base font-semibold text-primary-700-300 flex items-center">
						<svg
							class="w-5 h-5"
							fill="currentColor"
							viewBox="0 0 24 24"
							style="color: var(--color-gold)"
						>
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						<span>{content.recipeDetail.sections.notes}</span>
					</div>
					<p class="pl-4">{recipe.notes}</p>
					<span
						class="bottom-2 right-3 text-5xl absolute leading-none opacity-30 font-title"
						style="color: var(--color-gold)"
						aria-hidden="true"
					>
						{'\u201D'}
					</span>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="gap-4 mt-10 no-print flex flex-wrap justify-center">
				<Button variant="primary" onclick={handlePrint}>
					<span class="gap-2 flex items-center">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
							/>
						</svg>
						{content.recipeDetail.actions.print}
					</span>
				</Button>
				<Button variant="outline" onclick={handleShare}>
					<span class="gap-2 flex items-center">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
						{content.recipeDetail.actions.share}
					</span>
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ─── Recipe body: mdsvex-rendered steps (counter + :global needed) ─── */
	.recipe-body :global(ol) {
		list-style: none;
		counter-reset: recipe-step;
		padding: 0;
		margin: 0;
	}

	.recipe-body :global(li) {
		counter-increment: recipe-step;
		position: relative;
		padding-left: 3.25rem;
		margin-bottom: 1.5rem;
		line-height: 1.8;
	}

	.recipe-body :global(li)::before {
		content: counter(recipe-step);
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

	.recipe-body :global(p) {
		margin: 0;
	}

	/* ─── Print ─── */
	@media print {
		.recipe-body :global(li)::before {
			background: #ccc;
			color: #000;
		}
	}

</style>
