<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Badge } from '$lib/components';
	import { scrollReveal } from '$lib/utils/scroll-reveal';
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
</svelte:head>

<div class="pattern-overlay"></div>

<main
	class="max-w-6xl px-6 pt-8 relative z-10 mx-auto"
	style="padding-bottom: var(--space-section-lg)"
>
	<h1 class="text-3xl md:text-4xl mb-4 text-primary-700-300 text-center">
		Documents
	</h1>
	<p class="text-primary-600-400 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
		Les pages de garde et couvertures des carnets de Moumy — des morceaux d'histoire familiale.
	</p>

	{#if documents.length === 0}
		<p class="text-primary-400-600 text-center">Aucun document pour l'instant.</p>
	{:else}
		<div class="md:grid-cols-2 lg:grid-cols-3 gap-6 grid grid-cols-1">
			{#each documents as doc, i}
				{@const delay = (i * 0.08).toFixed(2)}
				<article class="document-card scroll-reveal" use:scrollReveal style="--reveal-delay: {delay}s">
					<a href="/recettes/{doc.slug}" class="block no-underline">
						<Card variant="elevated" noPadding>
							<div class="p-6">
								<Badge variant="gold" class="mb-3">Document</Badge>

								<h2
									class="text-xl font-semibold leading-tight mb-2 text-primary-900-100 capitalize"
									style="font-family: var(--font-handwriting)"
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
	.pattern-overlay {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B6F5C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

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

	.scroll-reveal {
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.5s ease, transform 0.5s ease;
		transition-delay: var(--reveal-delay, 0s);
	}

	.scroll-reveal.revealed {
		opacity: 1;
		transform: translateY(0);
	}
</style>
