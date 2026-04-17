<script lang="ts">
	interface Props {
		recipe: {
			slug: string;
			title: string;
			categoryLabel: string;
		};
	}

	let { recipe }: Props = $props();

	// Manuscript image: auto-detected from slug
	const manuscriptPath = $derived(`/img/${recipe.slug}.jpg`);

	// Try to load the image, fallback to placeholder on error
	let showImage = $state(true);
</script>

<div class="md:sticky md:top-8">
	<div
		class="bg-surface-50-950 rounded-3xl p-2 hover:-translate-y-0.5 hover:shadow-lg border-4 transition-all duration-300"
		style="border-color: var(--color-primary-700); box-shadow: var(--shadow-card)"
	>
		{#if showImage}
			<enhanced:img
				src={manuscriptPath}
				alt={`Manuscrit de ${recipe.title}`}
				class="rounded-2xl w-full transition-transform duration-300 hover:scale-[1.02]"
				loading="lazy"
				onerror={() => (showImage = false)}
			/>
		{:else}
			<div
				class="sm:min-h-[200px] p-8 rounded-2xl bg-surface-100-900 flex min-h-[280px] flex-col items-center justify-center border-2 border-dashed text-center"
				style="border-color: var(--color-gold)"
			>
				<svg
					class="w-12 h-12 mb-4 opacity-60"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					style="color: var(--color-gold)"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p
					class="text-xl leading-normal m-0 text-surface-950-50"
					style="font-family: var(--font-handwriting)"
				>
					Le manuscrit<br />de Moumy
				</p>
				<p class="text-xs tracking-wide mt-2 text-surface-500 uppercase">
					{recipe.categoryLabel}
				</p>
			</div>
		{/if}
	</div>
</div>
