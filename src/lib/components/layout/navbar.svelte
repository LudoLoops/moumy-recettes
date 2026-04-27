<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { themeStore } from '$lib/utils/theme.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { onMount, onDestroy } from 'svelte';

	onMount(() => {
		themeStore.init();
	});

	onDestroy(() => {
		themeStore.destroy();
	});
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[1fr_auto_1fr]">
		<AppBar.Lead>
			<a
				href="/"
				class="text-primary-700-300 hover:text-primary-900-100 transition-colors"
				style="font-size: var(--text-logo); font-weight: var(--weight-title); font-family: var(--font-handwriting)"
			>
				Les recettes de Moumy
			</a>
		</AppBar.Lead>

		<AppBar.Headline>
			<nav class="gap-4 md:gap-6 flex items-center">
				<a
					href="/recettes"
					class="text-primary-700-300 hover:text-primary-900-100 text-sm transition-colors"
					style="font-family: var(--font-body)"
				>
					Recettes
				</a>
				<a
					href="/ingredients"
					class="text-primary-700-300 hover:text-primary-900-100 text-sm transition-colors"
					style="font-family: var(--font-body)"
				>
					Ingrédients
				</a>
			</nav>
		</AppBar.Headline>

		<AppBar.Trail>
			<ThemeToggle />
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
