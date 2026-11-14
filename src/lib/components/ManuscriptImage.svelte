<script lang="ts">
	interface Props {
		recipe: {
			slug: string;
			title: string;
			categoryDisplay: string;
		};
	}

	let { recipe }: Props = $props();

	// Import all manuscript images, match by slug
	const imageModules = import.meta.glob<{ default: string }>('$data/img/*.{jpg,jpeg,png,webp}', {
		eager: true
	});

	const manuscriptSrc = $derived.by(() => {
		// Try full slug first, then base slug (cut after first _): BrA147_B → BrA147
		const baseSlug = recipe.slug.split('_')[0];
		const candidates = baseSlug !== recipe.slug ? [recipe.slug, baseSlug] : [recipe.slug];
		for (const candidate of candidates) {
			for (const [path, mod] of Object.entries(imageModules)) {
				if (path.includes(`/${candidate}.`)) {
					return mod.default;
				}
			}
		}
		return null;
	});

	let modalOpen = $state(false);

	function openModal() {
		if (manuscriptSrc) modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeModal();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="md:sticky md:top-8">
	<div
		class="rounded-3xl border-4 bg-surface-50-950 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
		style="border-color: var(--color-primary-700); box-shadow: var(--shadow-card)"
	>
		{#if manuscriptSrc}
			<button
				type="button"
				onclick={openModal}
				class="block w-full cursor-zoom-in overflow-hidden rounded-2xl"
				aria-label="Agrandir le manuscrit"
			>
				<img
					src={manuscriptSrc}
					alt={`Manuscrit de ${recipe.title}`}
					class="w-full transition-transform duration-300 hover:scale-[1.02]"
					loading="lazy"
				/>
			</button>
		{:else}
			<div
				class="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-100-900 p-8 text-center sm:min-h-[200px]"
				style="border-color: var(--color-gold)"
			>
				<svg
					class="mb-4 h-12 w-12 opacity-60"
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
				<p class="font-handwriting m-0 text-xl leading-normal text-surface-950-50">
					Le manuscrit<br />de Moumy
				</p>
				<p class="mt-2 text-xs tracking-wide text-surface-500 uppercase">
					{recipe.categoryDisplay}
				</p>
			</div>
		{/if}
	</div>
</div>

{#if modalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex animate-[fadeIn_0.2s_ease_forwards] items-center justify-center bg-black/80 backdrop-blur-sm print:hidden"
		onclick={closeModal}
		role="dialog"
		tabindex="-1"
		aria-label="Manuscrit agrandi"
	>
		<div onclick={(e) => e.stopPropagation()}>
			<img
				src={manuscriptSrc!}
				alt={`Manuscrit de ${recipe.title}`}
				class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
			/>
		</div>
		<button
			type="button"
			onclick={closeModal}
			class="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-surface-50 transition-colors hover:bg-white/20"
			aria-label="Fermer"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</div>
{/if}
