<script lang="ts">
	import { page } from '$app/stores';
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
				<article class="document-card fade-in" style="animation-delay: {(i * 0.05).toFixed(2)}s">
					<a href="/recettes/{doc.slug}" class="block no-underline">
						<Card variant="elevated" noPadding>
							<div class="p-6">
								<Badge variant="gold" class="mb-3">Document</Badge>

								<h2
									class="text-xl font-semibold leading-tight mb-2 text-primary-900-100 capitalize font-handwriting"
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

	.fade-in {
		animation: fadeIn 0.6s ease forwards;
		opacity: 0;
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
</style>
