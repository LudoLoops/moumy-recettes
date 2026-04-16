<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Footer, Navbar } from '$lib/components';
	import { themeStore } from '$lib/utils/theme.svelte';
	import '../app.css';
	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});

	let isHomepage = $derived($page.url.pathname === '/');
	let isRecipeDetailPage = $derived(/^\/recettes\/[^/]+$/.test($page.url.pathname));
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
