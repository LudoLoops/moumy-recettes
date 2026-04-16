<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, title, onClose, size = 'md', header, children, footer }: Props = $props();

	const sizeStyles: Record<string, string> = {
		sm: 'max-width: var(--max-w-modal-sm)',
		md: 'max-width: var(--max-w-modal-md)',
		lg: 'max-width: var(--max-w-modal-lg)',
		xl: 'max-width: var(--max-w-modal-xl)'
	};
</script>

<Dialog
	{open}
	onOpenChange={(e) => {
		if (!e.open) onClose();
	}}
>
	<Portal>
		<Dialog.Backdrop class="bg-black/50" />
		<Dialog.Positioner>
			<Dialog.Content class="card shadow-xl overflow-hidden" style={sizeStyles[size]}>
				<div class="modal-header border-surface-300-700 flex items-center justify-between border-b">
					<Dialog.Title class="modal-title">{title}</Dialog.Title>
					<Dialog.CloseTrigger class="btn-icon hover:bg-surface-200-800" aria-label="Close">
						✕
					</Dialog.CloseTrigger>
				</div>

				<div class="modal-body">
					{@render children()}
				</div>

				{#if footer}
					<div class="modal-header border-surface-300-700 border-t">
						{@render footer()}
					</div>
				{/if}
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>

<style>
	.modal-header {
		padding: var(--modal-header-py) var(--modal-header-px);
	}

	:global(.modal-title) {
		font-size: var(--text-modal-title);
		font-weight: var(--weight-title);
	}

	.modal-body {
		padding: var(--modal-body-p);
	}
</style>
