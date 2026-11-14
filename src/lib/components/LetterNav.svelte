<script lang="ts">
	interface Props {
		letters: string[];
	}

	let { letters }: Props = $props();
</script>

<nav class="relative z-1 py-6" aria-label="Navigation alphabétique">
	<ul class="flex flex-wrap justify-center gap-2">
		{#each letters as letter (letter)}
			<li>
				<a
					href="#lettre-{letter}"
					class="letter-link inline-flex h-[38px] w-[38px]
						items-center justify-center rounded-full border
						border-surface-200-800 bg-surface-50-950 font-[family-name:var(--font-title)] text-sm
						font-semibold text-primary-600-400 no-underline
						transition-all duration-300 ease-in-out
						max-md:h-8 max-md:w-8 max-md:text-xs
						md:h-[38px] md:w-[38px] md:text-sm"
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
