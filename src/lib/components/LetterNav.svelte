<script lang="ts">
	interface Props {
		letters: string[];
	}

	let { letters }: Props = $props();
</script>

<nav class="py-6 relative z-1" aria-label="Navigation alphabétique">
	<ul class="gap-2 flex flex-wrap justify-center">
		{#each letters as letter}
			<li>
				<a
					href="#lettre-{letter}"
					class="letter-link bg-surface-50-950 text-primary-600-400 border-surface-200-800
						font-semibold text-sm ease-in-out md:w-[38px]
						md:h-[38px] md:text-sm max-md:w-8 max-md:h-8
						max-md:text-xs inline-flex h-[38px]
						w-[38px] items-center justify-center
						rounded-full border font-[family-name:var(--font-title)]
						no-underline transition-all duration-300"
					aria-label="Aller à la lettre {letter}"
				>
					{letter}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.letter-link:hover {
		background: var(--color-gold);
		color: var(--color-surface-950);
		border-color: var(--color-gold);
		transform: translateY(-2px);
		box-shadow: var(--shadow-card);
	}
</style>
