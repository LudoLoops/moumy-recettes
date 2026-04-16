<script lang="ts">
	import { cn } from './utils/cn';

	type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'surface' | 'gold';

	interface Props {
		variant?: BadgeVariant;
		class?: string;
		children: any;
	}

	let { variant = 'surface', class: className = '', children }: Props = $props();

	const variants: Record<BadgeVariant, string> = {
		primary: 'preset-tonal-primary-500',
		secondary: 'preset-tonal-secondary-500',
		success: 'preset-tonal-success-500',
		warning: 'preset-tonal-warning-500',
		error: 'preset-tonal-error-500',
		surface: 'preset-tonal-surface-500',
		gold: 'gold-badge'
	};

	const badgeClass = $derived(cn('badge', variants[variant], className));
</script>

<span class={badgeClass}>{@render children()}</span>

<style>
	.gold-badge {
		background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
		color: oklch(24% 0.035 52deg);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		padding: 6px 14px;
		border-radius: 20px;
	}
</style>
