<script lang="ts">
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import { cn } from './utils/cn';

	interface AccordionItem {
		value: string;
		title: string;
		content: string;
	}

	interface Props {
		/** Array of items to render. Each needs a unique `value`, a `title`, and `content`. */
		items: AccordionItem[];
		/** Allow multiple items to be open simultaneously */
		multiple?: boolean;
		/** Additional CSS classes applied to the root wrapper */
		class?: string;
	}

	let { items, multiple = false, class: className = '' }: Props = $props();

	const rootClass = $derived(cn('sf-accordion', className));
</script>

{#if items.length > 0}
	<Accordion.Root {multiple} class={rootClass}>
		{#each items as item (item.value)}
			<Accordion.Item value={item.value} class="sf-accordion-item">
				<Accordion.ItemTrigger class="sf-accordion-trigger">
					<span class="sf-accordion-title">{item.title}</span>
					<Accordion.ItemIndicator class="sf-accordion-indicator" />
				</Accordion.ItemTrigger>
				<Accordion.ItemContent class="sf-accordion-content">
					{item.content}
				</Accordion.ItemContent>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
{/if}

<style>
	:global(.sf-accordion) {
		display: flex;
		flex-direction: column;
		gap: var(--gap-xs);
	}

	:global(.sf-accordion-item) {
		border: 1px solid var(--color-surface-200-800);
		border-radius: var(--radius-card);
		overflow: hidden;
	}

	:global(.sf-accordion-trigger) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--accordion-trigger-py) var(--accordion-trigger-px);
		font-size: var(--text-body);
		font-weight: var(--weight-label);
		color: var(--color-surface-700-300);
		cursor: pointer;
		background: transparent;
		border: none;
		text-align: left;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	:global(.sf-accordion-trigger:hover) {
		background-color: var(--color-surface-100-900);
		color: var(--color-surface-900-100);
	}

	:global(.sf-accordion-title) {
		flex: 1;
	}

	:global(.sf-accordion-indicator) {
		transition: transform 0.2s ease;
	}

	:global(.sf-accordion-content) {
		padding: 0 var(--accordion-content-px) var(--accordion-content-py);
		font-size: var(--text-body);
		color: var(--color-surface-600-400);
		line-height: 1.5;
	}
</style>
