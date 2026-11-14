<script lang="ts">
	import { navigating } from '$app/stores';
</script>

{#if $navigating}
	<div class="fixed top-0 right-0 left-0 z-[100] h-1">
		<div class="h-full animate-pulse bg-primary-500"></div>
	</div>
{/if}
