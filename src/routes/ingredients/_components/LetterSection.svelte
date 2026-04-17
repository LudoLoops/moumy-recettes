<script lang="ts">
	import IngredientCard from './IngredientCard.svelte';

	interface Recipe {
		slug: string;
		title: string;
		categoryDisplay: string;
	}

	interface Ingredient {
		name: string;
		recipes: Recipe[];
	}

	interface Props {
		letter: string;
		ingredients: Ingredient[];
		expandedIngredient: string | null;
		onToggle: (name: string) => void;
		index: number;
	}

	let { letter, ingredients, expandedIngredient, onToggle, index }: Props = $props();
</script>

<section
	id="lettre-{letter}"
	class="letter-section fade-in"
	style="animation-delay: {index * 0.05}s"
>
	<div class="gap-4 mb-6 pb-3 flex items-center border-b-2 border-[rgba(201,169,98,0.2)]">
		<span class="letter-badge">{letter}</span>
		<span class="text-sm text-primary-400-600 ml-auto">
			{ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}
		</span>
	</div>

	<div class="gap-3 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
		{#each ingredients as ingredient}
			<IngredientCard
				name={ingredient.name}
				recipes={ingredient.recipes}
				expanded={expandedIngredient === ingredient.name}
				onclick={() => onToggle(ingredient.name)}
			/>
		{/each}
	</div>
</section>

<style>
	.letter-section {
		margin-bottom: var(--space-section);
		scroll-margin-top: 2rem;
	}

	.letter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
		color: var(--color-surface-950);
		border-radius: 12px;
		font-family: var(--font-title);
		font-weight: 700;
		font-size: 1.5rem;
		flex-shrink: 0;
	}

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

	@media (max-width: 768px) {
		.letter-badge {
			width: 40px;
			height: 40px;
			font-size: 1.25rem;
			border-radius: 8px;
		}
	}
</style>
