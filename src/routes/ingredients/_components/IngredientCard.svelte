<script lang="ts">
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
	class="ingredient-card bg-surface-50-950 border-surface-200-800 rounded-xl overflow-hidden border transition-all duration-300"
	class:expanded
>
	<button
		class="ingredient-trigger hover:bg-surface-100-900 p-4 md:px-5 transition-background gap-3 flex w-full cursor-pointer items-center justify-between border-none bg-transparent text-left duration-200"
		{onclick}
		aria-expanded={expanded}
	>
		<span class="font-medium text-primary-900-100 text-[1.0625rem] capitalize">{name}</span>
		<span
			class="gap-1.5 text-primary-400-600 inline-flex shrink-0 items-center text-[0.8125rem] whitespace-nowrap"
		>
			{recipes.length} recette{recipes.length > 1 ? 's' : ''}
			<svg
				class="w-4 h-4 shrink-0 transition-transform duration-300"
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
			{#each recipes as recipe}
				<a
					href="/recettes/{recipe.slug}"
					class="recipe-link hover:bg-surface-100-900 gap-3 py-3 px-5 flex items-center justify-between no-underline transition-all duration-200"
				>
					<span class="font-medium text-primary-900-100 leading-snug text-[0.9375rem]"
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
