import { resolve } from 'node:path';
import { buildAndPublish } from './preview-build';
import { getPreviewStatus } from './preview';

async function run(): Promise<void> {
	const [rootArg, previewRootArg] = process.argv.slice(2);
	if (!rootArg || !previewRootArg)
		throw new Error('Preview worker requires repository and output paths.');
	const root = resolve(rootArg);
	const previewRoot = resolve(previewRootArg);
	const status = await getPreviewStatus(root, previewRoot);
	if (status.status === 'fresh') {
		console.log(
			`PREVIEW_RESULT ${JSON.stringify({ status: 'fresh', previewUrl: process.env.PREVIEW_URL ?? null })}`
		);
		return;
	}

	const result = await buildAndPublish(root, previewRoot, async (output) => {
		process.env.MOUMY_PREVIEW_BUILD_DIR = output;
		const vite = await import('vite');
		await vite.build();
		await import('./generate-sitemap.ts');
	});
	console.log(
		`PREVIEW_RESULT ${JSON.stringify({ ...result, previewUrl: process.env.PREVIEW_URL ?? null })}`
	);
}

if (import.meta.main) {
	try {
		await run();
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	}
}
