<script lang="ts">
	import { resolve } from '$app/paths';
	import content from '$lib/data/content';
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-surface-200-800 bg-surface-50-950">
	<div class="mx-auto max-w-[80rem] px-5 py-10 md:px-8 md:py-16 lg:px-10">
		<div class="flex flex-col items-center justify-between gap-10 md:flex-row">
			<div class="flex flex-col items-center gap-5 md:items-start">
				<a
					href={resolve('/')}
					class="font-handwriting text-xl font-bold text-surface-900-100 transition-colors hover:text-primary-600-400"
				>
					{content.footer.brand}
				</a>
				<p class="max-w-xs text-center text-base text-surface-600-400 md:text-left">
					{content.footer.description}
				</p>
			</div>

			<div class="flex flex-col items-center gap-5 md:items-end">
				<div class="flex flex-col items-center gap-1.5 text-sm text-surface-500 md:items-end">
					<p class="font-handwriting text-base text-primary-600-400">
						{content.footer.closing}
					</p>
					<p>&copy; {currentYear} {content.footer.copyright}</p>
				</div>
			</div>
		</div>
	</div>
</footer>
