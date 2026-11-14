<script lang="ts">
	interface Props {
		message?: string;
	}

	let { message = 'Loading...' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 p-8">
	<div class="h-2 w-48 overflow-hidden rounded-full bg-surface-200-800">
		<div class="h-full animate-pulse rounded-full bg-primary-500"></div>
	</div>
	{#if message}
		<p class="text-sm text-surface-600-400">{message}</p>
	{/if}
</div>
