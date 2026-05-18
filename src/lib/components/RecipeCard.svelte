<script lang="ts">
	import { Badge, Card } from '$lib/components';
	import type { Recipe } from '$data/recettes';

	interface Props {
		recipe: Recipe;
	}

	let { recipe }: Props = $props();
</script>

<article class="recipe-card fade-in">
	<a href="/recettes/{recipe.slug}" class="block no-underline">
		<Card variant="elevated" noPadding>
			<div class="p-6">
				<Badge variant="gold" class="mb-3">{recipe.categoryDisplay}</Badge>

				<h2 class="text-xl font-semibold leading-tight mb-2 text-primary-900-100 capitalize">
					{recipe.title}
				</h2>
				<p class="text-sm leading-relaxed mb-3 text-primary-600-400">
					{recipe.excerpt}
				</p>
				<div class="gap-4 text-xs text-primary-400-600 flex items-center">
					<span class="gap-1 flex items-center">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						{recipe.prepTime}
					</span>
					<span class="gap-1 flex items-center">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/></svg
						>
						{recipe.servings}
					</span>
					<span class="gap-1 flex items-center">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/></svg
						>
						{recipe.difficulty}
					</span>
				</div>
			</div>
		</Card>
	</a>
</article>

<style>
	.recipe-card :global(.card) {
		position: relative;
		overflow: hidden;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s ease;
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
</style>
