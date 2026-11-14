<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { resolve } from '$app/paths';
	import { themeStore } from '$lib/utils/theme.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { onMount, onDestroy } from 'svelte';
	import content from '$lib/data/content';

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
				href={resolve('/')}
				class="font-handwriting text-primary-700-300 transition-colors hover:text-primary-900-100"
				style="font-size: var(--text-logo); font-weight: var(--weight-title)"
			>
				{content.nav.brand}
			</a>
		</AppBar.Lead>

		<AppBar.Headline>
			<nav class="flex items-center gap-4 md:gap-6">
				<a
					href={resolve('/recettes')}
					class="font-body text-sm text-primary-700-300 transition-colors hover:text-primary-900-100"
				>
					{content.nav.recipes}
				</a>
				<a
					href={resolve('/ingredients')}
					class="font-body text-sm text-primary-700-300 transition-colors hover:text-primary-900-100"
				>
					{content.nav.ingredients}
				</a>
				<a
					href={resolve('/documents')}
					class="font-body text-sm text-primary-700-300 transition-colors hover:text-primary-900-100"
				>
					{content.nav.documents}
				</a>
			</nav>
		</AppBar.Headline>

		<AppBar.Trail>
			<ThemeToggle />
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
