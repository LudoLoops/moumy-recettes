<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import { Footer, Navbar } from '$lib/components';
	import { themeStore } from '$lib/utils/theme.svelte';
	import '../app.css';
	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});

	let isHomepage = $derived($page.url.pathname === '/');
	let isRecipeDetailPage = $derived(/^\/recettes\/[^/]+$/.test($page.url.pathname));

	// View Transitions — smooth fade between pages
	beforeNavigate(({ type, willUnload }) => {
		if (type === 'link' && !willUnload && document.startViewTransition) {
			return new Promise((resolve) => {
				document.startViewTransition(() => {
					resolve();
				});
			});
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	{#if !isHomepage}
		<Navbar />
	{/if}

	<main class="flex-1 {!isHomepage ? 'pt-16' : ''}">
		{@render children()}
	</main>

	{#if !isRecipeDetailPage}
		<Footer />
	{/if}
</div>

<style>
	:global(::view-transition-old(root)) {
		animation: 200ms ease-out both fade-out;
	}
	:global(::view-transition-new(root)) {
		animation: 200ms ease-in both fade-in;
	}

	@keyframes fade-out {
		from { opacity: 1; }
		to { opacity: 0; }
	}
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
