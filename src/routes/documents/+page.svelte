<script lang="ts">
	import { resolve } from '$app/paths';
	import { Card, Badge } from '$lib/components';
	import type { Recipe } from '$data/recettes';

	let { data } = $props();
	let documents: Recipe[] = $derived(data.documents ?? []);
</script>

<svelte:head>
	<title>Documents — Les recettes de Moumy</title>
	<meta
		name="description"
		content="Les carnets et documents manuscrits de Moumy, conservés avec soin."
	/>
	<meta property="og:title" content="Documents — Les recettes de Moumy" />
	<meta
		property="og:description"
		content="Les carnets et documents manuscrits de Moumy, conservés avec soin."
	/>
</svelte:head>

<div class="pattern-overlay"></div>

<main
	class="relative z-10 mx-auto max-w-6xl px-6 pt-8"
	style="padding-bottom: var(--space-section-lg)"
>
	<h1 class="mb-4 text-center text-3xl text-primary-700-300 md:text-4xl">Documents</h1>
	<p class="mx-auto mb-12 max-w-2xl text-center leading-relaxed text-primary-600-400">
		Les pages de garde et couvertures des carnets de Moumy — des morceaux d'histoire familiale.
	</p>

	{#if documents.length === 0}
		<p class="text-center text-primary-400-600">Aucun document pour l'instant.</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each documents as doc, i (doc.slug)}
				<article class="document-card fade-in" style="animation-delay: {(i * 0.05).toFixed(2)}s">
					<a href={resolve('/recettes/[slug]', { slug: doc.slug })} class="block no-underline">
						<Card variant="elevated" noPadding>
							<div class="p-6">
								<Badge variant="gold" class="mb-3">Document</Badge>

								<h2
									class="font-handwriting mb-2 text-xl leading-tight font-semibold text-primary-900-100 capitalize"
								>
									{doc.title.replace(/^Document:\s*/i, '')}
								</h2>

								{#if doc.excerpt}
									<p class="text-sm leading-relaxed text-primary-600-400 italic">
										{doc.excerpt}
									</p>
								{/if}
							</div>
						</Card>
					</a>
				</article>
			{/each}
		</div>
	{/if}
</main>

<style>
	.document-card :global(.card) {
		position: relative;
		overflow: hidden;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s ease;
	}

	.document-card:hover :global(.card) {
		transform: translateY(-6px);
		box-shadow: var(--shadow-hover);
	}

	.document-card :global(.card)::before {
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

	.document-card:hover :global(.card)::before {
		opacity: 1;
	}
</style>
