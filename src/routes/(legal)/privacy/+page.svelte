<script lang="ts">
	import { Card } from '$lib/components/ui';
	const currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>Politique de confidentialité - Les recettes de Moumy</title>
	<meta
		name="description"
		content="Politique de confidentialité — collecte, traitement et protection des données personnelles sur Les recettes de Moumy."
	/>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<h1 class="mb-8 text-3xl font-black tracking-tight uppercase">Privacy Policy</h1>

	<Card padding="p-8 sm:p-12">
		<div class="space-y-10">
			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					1. Introduction
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					This privacy policy describes how we collect, use, and protect your personal information
					when you use our website and services.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					2. Data collected
				</h2>
				<p class="mb-4 leading-relaxed text-surface-600-400">
					We may collect the following types of data:
				</p>
				<ul class="ml-2 list-inside list-disc space-y-2 text-surface-600-400">
					<li>Identification information (name, email)</li>
					<li>Connection information (IP address, browser, device)</li>
					<li>Service usage data</li>
				</ul>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					3. Purpose of processing
				</h2>
				<p class="mb-4 leading-relaxed text-surface-600-400">Your data is used to:</p>
				<ul class="ml-2 list-inside list-disc space-y-2 text-surface-600-400">
					<li>Manage your user account</li>
					<li>Provide our services</li>
					<li>Improve our service</li>
					<li>Comply with our legal obligations</li>
				</ul>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					4. Legal basis
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					The processing of your personal data is based on the execution of the contract, compliance
					with our legal obligations, and your consent.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					5. Retention period
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					Your data is retained for the duration of your registration, plus the retention periods
					required by law.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					6. Your rights
				</h2>
				<p class="mb-4 leading-relaxed text-surface-600-400">
					Under GDPR, you have the following rights:
				</p>
				<ul class="ml-2 list-inside list-disc space-y-2 text-surface-600-400">
					<li>Right of access to your data</li>
					<li>Right to rectification</li>
					<li>Right to erasure</li>
					<li>Right to data portability</li>
					<li>Right to object</li>
				</ul>
				<p class="mt-4 leading-relaxed text-surface-600-400 italic">
					To exercise these rights, contact us at: [email]
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					7. Security
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					We implement appropriate technical and organizational measures to protect your personal
					data against unauthorized access, modification, disclosure, or destruction.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					8. Cookies
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					Our website uses cookies to ensure proper functioning and improve the user experience. You
					can configure your browser to refuse cookies.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-xl font-bold tracking-wide text-primary-600-400 uppercase">
					9. Contact
				</h2>
				<p class="leading-relaxed text-surface-600-400">
					For any questions regarding this policy, contact our DPO at: [email]
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
