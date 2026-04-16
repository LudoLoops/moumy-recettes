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

	let isAdminPage = $derived($page.url.pathname.startsWith('/admin'));
	let isHomepage = $derived($page.url.pathname === '/');
	let isRecipePage = $derived($page.url.pathname.startsWith('/recette'));
</script>

<div class="flex flex-col min-h-screen">
	{#if !isAdminPage && !isHomepage && !isRecipePage}
		<Navbar />
	{/if}

	<main class="flex-1 {!isAdminPage && !isHomepage && !isRecipePage ? 'pt-16' : ''}">
		{@render children()}
	</main>

	{#if !isAdminPage && !isRecipePage}
		<Footer />
	{/if}
</div>
