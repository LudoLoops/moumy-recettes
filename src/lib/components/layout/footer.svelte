<script lang="ts">
	import content from '$lib/data/content';
	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-surface-50-950 border-surface-200-800 border-t">
	<div class="py-10 md:py-16 px-5 md:px-8 lg:px-10 mx-auto max-w-[80rem]">
		<div class="md:flex-row gap-10 flex flex-col items-center justify-between">
			<div class="md:items-start gap-5 flex flex-col items-center">
				<a
					href="/"
					class="text-surface-900-100 hover:text-primary-600-400 text-xl font-bold transition-colors font-handwriting"
				>
					{content.footer.brand}
				</a>
				<p class="text-surface-600-400 max-w-xs md:text-left text-base text-center">
					{content.footer.description}
				</p>
			</div>

			<div class="md:items-end gap-5 flex flex-col items-center">
				<div class="text-surface-500 md:items-end gap-1.5 text-sm flex flex-col items-center">
					<p class="text-primary-600-400 text-base font-handwriting">
						{content.footer.closing}
					</p>
					<p>&copy; {currentYear} {content.footer.copyright}</p>
				</div>
			</div>
		</div>
	</div>
</footer>
