<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Button } from '$lib/components';

	let { data }: { data: PageData } = $props();
	const recipe = $derived(data.recipe);

	// Eager-load all mdsvex recipe modules for the body component
	const recipeModules = import.meta.glob<{ default: any }>('$lib/data/recipes/*.md', {
		eager: true
	});

	const bodyComponent = $derived.by(() => {
		for (const [path, mod] of Object.entries(recipeModules)) {
			if (path.includes(`/${recipe.slug}.md`)) {
				return mod.default;
			}
		}
		return null;
	});

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
</script>

<svelte:head>
	<title>{recipe.title} — Les recettes de Moumy</title>
	<meta name="description" content={recipe.excerpt} />
	<meta property="og:title" content="{recipe.title} — Les recettes de Moumy" />
	<meta property="og:description" content={recipe.excerpt} />
	<meta property="og:type" content="article" />
</svelte:head>

<div class="pattern-overlay"></div>

<div
	class="max-w-6xl px-4 md:px-6 relative z-10 mx-auto"
	style="padding-top: var(--space-section); padding-bottom: var(--space-section-lg)"
>
	<!-- Back link -->
	<Button variant="ghost" size="sm" onclick={() => history.back()} class="no-print">
		<span class="gap-1 flex items-center">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Retour
		</span>
	</Button>

	<!-- Two-column grid -->
	<div class="md:grid-cols-[1fr_2fr] gap-8 md:gap-12 mt-6 md:mt-8 grid grid-cols-1">
		<!-- Left: Manuscript image (sticky on desktop) -->
		<div class="fade-in">
			<div class="md:sticky md:top-8">
				<div class="recipe-image-frame bg-surface-50-950">
					{#if recipe.manuscript}
						<img
							src={recipe.manuscript}
							alt="Manuscrit de {recipe.title}"
							class="rounded-lg w-full"
						/>
					{:else}
						<div
							class="sm:min-h-[200px] p-8 rounded-lg bg-surface-100-900 flex min-h-[280px] flex-col items-center justify-center border-2 border-dashed text-center"
							style="border-color: var(--color-gold)"
						>
							<svg
								class="w-12 h-12 mb-4 opacity-60"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								style="color: var(--color-gold)"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p
								class="text-xl leading-normal m-0 text-surface-950-50"
								style="font-family: var(--font-handwriting)"
							>
								Le manuscrit<br />de Moumy
							</p>
							<p class="text-xs tracking-wide mt-2 text-surface-500 uppercase">
								{recipe.categoryLabel}
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Right: Recipe content -->
		<div class="fade-in" style="animation-delay: 0.1s;">
			<Badge variant="gold">{recipe.categoryLabel}</Badge>

			<h1 class="text-4xl md:text-[2.75rem] leading-tight mt-4 mb-2">
				{recipe.title}
			</h1>

			<p class="text-lg leading-relaxed mb-6 text-surface-700-300 italic">
				{recipe.excerpt}
			</p>

			<!-- Meta info grid -->
			<div class="sm:grid-cols-4 gap-4 mb-8 grid grid-cols-2">
				<div class="meta-item bg-surface-100-900 border-surface-200-800 border">
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
							>Préparation</span
						>
						<span class="text-sm font-semibold block">{recipe.prepTime}</span>
					</div>
				</div>

				<div class="meta-item bg-surface-100-900 border-surface-200-800 border">
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
							>Cuisson</span
						>
						<span class="text-sm font-semibold block">{recipe.cookTime}</span>
					</div>
				</div>

				<div class="meta-item bg-surface-100-900 border-surface-200-800 border">
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
							>Portions</span
						>
						<span class="text-sm font-semibold block">{recipe.servings}</span>
					</div>
				</div>

				<div class="meta-item bg-surface-100-900 border-surface-200-800 border">
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
							>Difficulté</span
						>
						<span class="text-sm font-semibold block">{recipe.difficulty}</span>
					</div>
				</div>
			</div>

			<!-- Ingredients -->
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
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					Ingrédients
				</h2>
				{#each recipe.ingredients as ingredient}
					<div
						class="ingredient-item py-2 border-surface-200-800 leading-normal hover:pl-2 flex items-start border-b transition-all duration-300 last:border-b-0"
					>
						{ingredient}
					</div>
				{/each}
			</section>

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
					Préparation
				</h2>
				<div class="recipe-body leading-loose" style="font-family: var(--font-body)">
					{#if bodyComponent}
						<bodyComponent></bodyComponent>
					{/if}
				</div>
			</section>

			<!-- Moumy's notes -->
			{#if recipe.notes}
				<div
					class="moumy-notes mt-8 p-6 rounded-xl leading-relaxed text-2xl sm:text-xl text-primary-700-300 bg-surface-100-900 relative"
					style="font-family: var(--font-handwriting); border: 2px dashed var(--color-gold)"
				>
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
						<span>Notes de Moumy</span>
					</div>
					<p class="pl-4">{recipe.notes}</p>
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
						Imprimer
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
						Partager
					</span>
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ─── Pattern overlay ─── */
	.pattern-overlay {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F5C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	/* ─── Manuscript image frame (pseudo-states need CSS) ─── */
	.recipe-image-frame {
		border: 4px solid var(--color-primary-700);
		border-radius: 12px;
		padding: 8px;
		box-shadow: var(--shadow-card);
		transition: all 0.3s ease;
	}

	.recipe-image-frame:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-hover);
	}

	.recipe-image-frame img {
		border-radius: 8px;
		transition: transform 0.3s ease;
	}

	.recipe-image-frame img:hover {
		transform: scale(1.02);
	}

	/* ─── Meta items ─── */
	.meta-item {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		padding: 0.75rem;
		border: 1px solid transparent;
		border-radius: 10px;
		transition: all 0.3s ease;
	}

	.meta-item:hover {
		border-color: var(--color-gold);
		transform: translateY(-1px);
	}

	/* ─── Ingredient list (needs ::before pseudo-element) ─── */
	.ingredient-item:last-child {
		border-bottom: none;
	}

	.ingredient-item::before {
		content: '\2022';
		color: var(--color-gold);
		font-weight: bold;
		font-size: 1.25rem;
		margin-right: 0.75rem;
		flex-shrink: 0;
	}

	/* ─── Recipe body: mdsvex-rendered steps (needs :global + ::before) ─── */
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
		flex-shrink: 0;
	}

	.recipe-body :global(p) {
		margin: 0;
	}

	/* ─── Moumy notes (needs ::before pseudo-element) ─── */
	.moumy-notes::before {
		content: '\201C';
		position: absolute;
		top: 8px;
		left: 12px;
		font-size: 3rem;
		color: var(--color-gold);
		opacity: 0.3;
		font-family: var(--font-title);
		line-height: 1;
	}

	/* ─── Animations ─── */
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

	/* ─── Print ─── */
	@media print {
		.no-print {
			display: none !important;
		}
		.pattern-overlay {
			display: none;
		}
		.recipe-image-frame {
			border-color: #ccc;
			box-shadow: none;
		}
		.recipe-body :global(li)::before {
			background: #ccc;
			color: #000;
		}
		.meta-item {
			border: 1px solid #ddd;
			background: #f5f5f5;
		}
		.meta-item:hover {
			transform: none;
		}
	}

	/* ─── Mobile ─── */
	@media (max-width: 640px) {
		.meta-item {
			padding: 0.5rem;
		}
	}
</style>
