<script lang="ts">
	import { themeStore } from '$lib/utils/theme.svelte';

	interface Props {
		onClose: () => void;
		open: boolean;
	}

	let { onClose, open }: Props = $props();

	function handleThemeToggle() {
		themeStore.toggle();
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

{#if open}
	<div
		class="md:hidden inset-0 top-16 bg-surface-50-900 fixed z-40"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="p-6 flex flex-col">
			<a
				href="/"
				onclick={onClose}
				class="px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm block"
			>
				Accueil
			</a>
			<a
				href="/ingredients"
				onclick={onClose}
				class="px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm block"
			>
				Ingrédients
			</a>

			<button
				type="button"
				onclick={handleThemeToggle}
				class="gap-3 px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm border-surface-300-700 pt-6 flex items-center border-t"
			>
				{#if themeStore.isDark}
					Light Mode
				{:else}
					Dark Mode
				{/if}
			</button>
		</div>
	</div>
{/if}
