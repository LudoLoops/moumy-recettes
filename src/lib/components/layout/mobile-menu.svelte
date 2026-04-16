<script lang="ts">
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import { themeStore } from '$lib/utils/theme.svelte';

	interface Props {
		session: ReturnType<typeof authClient.useSession>;
		onClose: () => void;
		open: boolean;
	}

	let { session, onClose, open }: Props = $props();

	const showLogout = $derived(
		$page.url.pathname === '/dashboard' || $page.url.pathname.startsWith('/admin')
	);
	const isLoggedIn = $derived(!$session.isPending && $session.data);
	const isAdmin = $derived($session.data?.user?.role === 'admin');

	function handleThemeToggle() {
		themeStore.toggle();
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

{#if open}
	<div
		class="md:hidden inset-0 top-16 bg-surface-50-900 fixed z-40"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="p-6 flex flex-col">
			{#if isLoggedIn}
				<div class="mb-6 p-4 rounded-xl bg-surface-100-800">
					<p class="font-medium text-sm">{$session.data?.user?.name ?? ''}</p>
					<p class="text-xs text-muted-foreground">{$session.data?.user?.email ?? ''}</p>
				</div>

				{#if isAdmin}
					<a
						href="/admin"
						onclick={onClose}
						class="px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm block"
					>
						Admin
					</a>
				{/if}
				<a
					href="/dashboard"
					onclick={onClose}
					class="px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm block"
				>
					Dashboard
				</a>

				{#if showLogout}
					<form action="/logout" method="POST" class="contents">
						<button
							type="submit"
							class="gap-3 px-4 py-3 rounded-xl hover:bg-error-500/10 text-sm text-error-500 border-surface-300-700 pt-6 flex w-full items-center border-t text-left"
						>
							Sign Out
						</button>
					</form>
				{/if}
			{/if}

			<button
				type="button"
				onclick={handleThemeToggle}
				class="gap-3 px-4 py-3 rounded-xl hover:bg-surface-200-800 text-sm border-surface-300-700 pt-6 flex items-center border-t"
			>
				{#if themeStore.isDark}
					Light Mode
				{:else}
					Dark Mode
				{/if}
			</button>
		</div>
	</div>
{/if}
