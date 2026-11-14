<script lang="ts">
	import { resolve } from '$app/paths';
	import { Card } from '$lib/components/ui';
	const currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>Mentions légales - Les recettes de Moumy</title>
	<meta
		name="description"
		content="Mentions légales du site Les recettes de Moumy — éditeur, hébergement, propriété intellectuelle et contact."
	/>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<h1 class="mb-8 text-3xl font-black tracking-tight uppercase">Legal Notice</h1>

	<Card padding="p-8 sm:p-12">
		<div class="space-y-10">
			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					1. Publisher
				</h2>
				<div class="leading-relaxed text-surface-600-400">
					This website is published by:<br />
					<strong class="text-surface-900-100">[Company name]</strong><br />
					[Legal form] with a capital of [amount]<br />
					Registered office: [address]<br />
					SIRET: [SIRET number]<br />
					Phone: [phone]<br />
					Email: [email]<br />
					Publication director: [name]
				</div>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					2. Hosting
				</h2>
				<div class="leading-relaxed text-surface-600-400">
					This website is hosted by:<br />
					<strong class="text-surface-900-100">[Hosting provider]</strong><br />
					[Hosting provider address]<br />
					[Hosting provider phone]
				</div>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					3. Intellectual property
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					All content on this website (texts, images, videos, logos, etc.) is protected by copyright
					and trademark law. Any reproduction, representation, modification, publication, or
					adaptation of all or part of the site's elements is prohibited without prior written
					authorization.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					4. Personal data
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					For any information regarding the processing of your personal data, please consult our
					<a href={resolve('/privacy')} class="font-bold text-primary-500 hover:underline"
						>privacy policy</a
					>.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					5. Cookies
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					This website uses cookies to improve the user experience. By continuing to browse this
					site, you accept the use of cookies.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					6. Contact
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					For any questions regarding this legal notice, you can contact us at: [contact email]
				</p>
			</section>
		</div>

		<div class="mt-12 border-t border-surface-200-800 pt-8">
			<p class="text-surface-500-400 text-xs font-bold tracking-widest uppercase">
				Last updated: {currentYear}
			</p>
		</div>
	</Card>
</div>
