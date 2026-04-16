<script lang="ts">
	interface Props {
		letters: string[];
	}

	let { letters }: Props = $props();
</script>

<nav class="letter-nav" aria-label="Navigation alphabétique">
	<ul class="gap-2 flex flex-wrap justify-center">
		{#each letters as letter}
			<li>
				<a
					href="#lettre-{letter}"
					class="letter-link bg-surface-50-950 text-primary-600-400 border-surface-200-800 border"
					aria-label="Aller à la lettre {letter}"
				>
					{letter}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.letter-nav {
		position: relative;
		z-index: 1;
		border-bottom: 1px solid rgba(139, 111, 92, 0.1);
		padding: 1.5rem 0;
	}

	.letter-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		font-family: var(--font-title);
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.letter-link:hover {
		background: var(--color-gold);
		color: var(--color-surface-950);
		border-color: var(--color-gold);
		transform: translateY(-2px);
		box-shadow: var(--shadow-card);
	}

	@media (max-width: 768px) {
		.letter-link {
			width: 32px;
			height: 32px;
			font-size: 0.75rem;
		}
	}
</style>
