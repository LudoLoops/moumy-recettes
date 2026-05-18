<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import { Footer, Navbar } from '$lib/components';
	import { SITE_URL } from '$lib/config';
	import { themeStore } from '$lib/utils/theme.svelte';
	import { SITE_URL } from '$lib/config';
	import '../app.css';
	let { children } = $props();

	let canonicalUrl = $derived(`${SITE_URL}${$page.url.pathname}`);

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

<svelte:head>
<link rel="canonical" href={canonicalUrl} />
	<meta property="og:site_name" content="Les recettes de Moumy" />
	<meta property="og:url" content="{SITE_URL}{$page.url.pathname}" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="{SITE_URL}" />
</svelte:head>

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
