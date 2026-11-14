<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components';

	interface Recipe {
		slug: string;
		title: string;
		categoryDisplay: string;
	}

	interface Props {
		name: string;
		recipes: Recipe[];
		expanded: boolean;
		onclick: () => void;
	}

	let { name, recipes, expanded, onclick }: Props = $props();
</script>

<div
	class="ingredient-card overflow-hidden rounded-xl border border-surface-200-800 bg-surface-50-950 transition-all duration-300"
	class:expanded
>
	<button
		class="ingredient-trigger transition-background flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-4 text-left duration-200 hover:bg-surface-100-900 md:px-5"
		{onclick}
		aria-expanded={expanded}
	>
		<span class="text-[1.0625rem] font-medium text-primary-900-100 capitalize">{name}</span>
		<span
			class="inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] whitespace-nowrap text-primary-400-600"
		>
			{recipes.length} recette{recipes.length > 1 ? 's' : ''}
			<svg
				class="h-4 w-4 shrink-0 transition-transform duration-300"
				class:rotate-180={expanded}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</span>
	</button>

	{#if expanded}
		<div class="ingredient-recipes">
			{#each recipes as recipe (recipe.slug)}
				<a
					href={resolve('/recettes/[slug]', { slug: recipe.slug })}
					class="recipe-link flex items-center justify-between gap-3 px-5 py-3 no-underline transition-all duration-200 hover:bg-surface-100-900"
				>
					<span class="text-[0.9375rem] leading-snug font-medium text-primary-900-100"
						>{recipe.title}</span
					>
					<Badge variant="gold">{recipe.categoryDisplay}</Badge>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.ingredient-card {
		box-shadow: var(--shadow-card);
	}

	.ingredient-card:hover,
	.ingredient-card.expanded {
		border-color: var(--color-secondary-300);
		box-shadow: var(--shadow-hover);
	}

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

	.recipe-link {
		border-left: 3px solid transparent;
	}

	.recipe-link:hover {
		border-left-color: var(--color-gold);
		padding-left: 1.5rem;
	}

	@media (max-width: 768px) {
		.ingredient-trigger {
			padding: 0.875rem 1rem;
		}

		.recipe-link {
			padding: 0.625rem 1rem;
			flex-wrap: wrap;
		}
	}
</style>
