<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { themeStore } from '$lib/utils/theme.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { onMount, onDestroy } from 'svelte';
	import MobileMenu from './mobile-menu.svelte';
	let mobileMenuOpen = $state(false);

	onMount(() => {
		themeStore.init();
	});

	onDestroy(() => {
		themeStore.destroy();
	});

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<MobileMenu onClose={closeMobileMenu} open={mobileMenuOpen} />

<AppBar>
	<AppBar.Toolbar class="grid-cols-[1fr_auto_1fr]">
		<AppBar.Lead>
			<a
				href="/"
				class="text-surface-50-900 hover:text-primary-300-700 transition-colors"
				style="font-size: var(--text-logo); font-weight: var(--weight-title); font-family: var(--font-handwriting)"
			>
				Les recettes de Moumy
			</a>
		</AppBar.Lead>

		<AppBar.Headline>
			<nav class="md:flex gap-6 hidden items-center">
				<a
					href="/recettes"
					class="text-surface-50-900 hover:text-primary-300-700 text-sm transition-colors"
					style="font-family: var(--font-body)"
				>
					Recettes
				</a>
				<a
					href="/ingredients"
					class="text-surface-50-900 hover:text-primary-300-700 text-sm transition-colors"
					style="font-family: var(--font-body)"
				>
					Ingrédients
				</a>
			</nav>
		</AppBar.Headline>

		<AppBar.Trail>
			<ThemeToggle />

			<button
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				class="md:hidden btn-icon text-surface-50-900"
				aria-label="Menu"
			>
				{#if mobileMenuOpen}
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				{:else}
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 12h18M3 6h18M3 18h18" />
					</svg>
				{/if}
			</button>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
