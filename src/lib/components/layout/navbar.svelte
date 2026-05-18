<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
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
				href="/"
				class="text-primary-700-300 hover:text-primary-900-100 transition-colors font-handwriting"
				style="font-size: var(--text-logo); font-weight: var(--weight-title)"
			>
				{content.nav.brand}
			</a>
		</AppBar.Lead>

		<AppBar.Headline>
			<nav class="gap-4 md:gap-6 flex items-center">
				<a
					href="/recettes"
					class="text-primary-700-300 hover:text-primary-900-100 text-sm transition-colors font-body"
				>
					{content.nav.recipes}
				</a>
				<a
					href="/ingredients"
					class="text-primary-700-300 hover:text-primary-900-100 text-sm transition-colors font-body"
				>
					{content.nav.ingredients}
				</a>
				<a
					href="/documents"
					class="text-primary-700-300 hover:text-primary-900-100 text-sm transition-colors font-body"
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
