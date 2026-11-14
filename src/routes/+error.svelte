<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import Icon from '$lib/components/icons/Icon.svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message);

	const errorConfig = $derived(
		status === 404
			? {
					code: '404',
					title: 'Page Not Found',
					description: "The page you're looking for doesn't exist or has been moved.",
					icon: 'search',
					action: { label: 'Go Home', href: '/' }
				}
			: {
					code: status.toString(),
					title: 'Something Went Wrong',
					description: 'An unexpected error occurred. Please try again later.',
					icon: 'alertCircle',
					action: {
						label: 'Retry',
						href: $page.url.pathname
					}
				}
	);
</script>

<svelte:head>
	<title>{errorConfig.code} - {errorConfig.title}</title>
	<meta name="description" content={errorConfig.description} />
	<meta property="og:title" content="{errorConfig.code} - {errorConfig.title}" />
	<meta property="og:description" content={errorConfig.description} />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-surface-50-950 px-4 py-16">
	<div class="max-w-lg card p-8 text-center sm:p-12">
		<div
			class="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary-500/10"
		>
			<Icon name={errorConfig.icon} size={48} class="text-primary-500" />
		</div>

		<div class="space-y-4">
			<p class="text-8xl font-black text-primary-500/20">{errorConfig.code}</p>
			<h1 class="text-2xl font-bold sm:text-3xl">{errorConfig.title}</h1>
			<p class="text-base text-surface-600-400">{errorConfig.description}</p>

			{#if status !== 404 && message}
				<div
					class="mt-6 rounded-xl border border-surface-300-700 bg-surface-50-950/50 p-4 text-left"
				>
					<p class="text-surface-500-400 mb-1 text-[10px] font-bold tracking-wider uppercase">
						Error Details
					</p>
					<p class="font-mono text-xs leading-relaxed break-all text-error-500">{message}</p>
				</div>
			{/if}
		</div>

		<div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Retry targets the current local page path. -->
			<a href={errorConfig.action.href} class="btn preset-filled-primary-500 btn-lg px-8">
				{errorConfig.action.label}
			</a>
			<a href={resolve('/')} class="btn preset-outlined-primary-500 btn-lg px-8">Go Home</a>
		</div>
	</div>
</div>
