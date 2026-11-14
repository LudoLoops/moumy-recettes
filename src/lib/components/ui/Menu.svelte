<script lang="ts">
	import { Menu as SkeletonMenu, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';

	interface MenuItem {
		/** Unique key */
		key: string;
		/** Display label */
		label: string;
		/** Optional icon snippet */
		icon?: Snippet;
		/** Disabled */
		disabled?: boolean;
		/** Danger style */
		danger?: boolean;
	}

	interface Props {
		/** Trigger element */
		trigger: Snippet;
		/** Menu items */
		items: MenuItem[];
		/** Called when an item is selected */
		onSelect: (key: string) => void;
	}

	let { trigger, items, onSelect }: Props = $props();
</script>

<SkeletonMenu>
	<SkeletonMenu.Trigger>
		{@render trigger()}
	</SkeletonMenu.Trigger>

	<Portal>
		<SkeletonMenu.Positioner>
			<SkeletonMenu.Content
				class="z-50 card border border-surface-300-700 shadow-lg"
				style="padding: var(--menu-panel-p); min-width: var(--menu-min-w)"
			>
				{#each items as item (item.key)}
					<button
						type="button"
						class="flex w-full items-center transition-colors
							{item.disabled
							? 'cursor-not-allowed opacity-50'
							: item.danger
								? 'text-error-500 hover:bg-error-500/10'
								: 'hover:bg-surface-200-800'}"
						style="gap: var(--gap-sm); padding: var(--menu-item-py) var(--menu-item-px); font-size: var(--text-body); border-radius: var(--radius-menu-item)"
						disabled={item.disabled}
						onclick={() => {
							if (!item.disabled) onSelect(item.key);
						}}
					>
						{#if item.icon}
							<span class="shrink-0">{@render item.icon()}</span>
						{/if}
						{item.label}
					</button>
				{/each}
			</SkeletonMenu.Content>
		</SkeletonMenu.Positioner>
	</Portal>
</SkeletonMenu>
