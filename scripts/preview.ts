#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, open, readdir, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PREVIEW_ROOT = resolve(
	process.env.MOUMY_PREVIEW_DIR ?? join(homedir(), '.local', 'share', 'moumy-preview')
);
export const MANIFEST_NAME = '.moumy-preview-manifest.json';
const SOURCE_DIRS = ['src', 'static', 'scripts'];
const SOURCE_FILES = [
	'package.json',
	'bun.lock',
	'svelte.config.js',
	'vite.config.ts',
	'tsconfig.json',
	'.node-version'
];
interface PreviewManifest {
	version: 1;
	fingerprint: string;
	generatedAt: string;
	sourceFiles: number;
}

function isWithin(parent: string, child: string): boolean {
	const path = relative(parent, child);
	return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

async function collectSourceFiles(directory: string): Promise<string[]> {
	const files: string[] = [];
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return files;
		throw error;
	}

	for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
		if (entry.isSymbolicLink()) continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await collectSourceFiles(path)));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

export async function fingerprintSources(root = REPO_ROOT): Promise<PreviewManifest> {
	const files = new Set<string>();
	for (const name of SOURCE_FILES) files.add(join(root, name));
	for (const entry of await readdir(root, { withFileTypes: true })) {
		if (entry.isFile() && (entry.name === '.env' || entry.name.startsWith('.env.'))) {
			files.add(join(root, entry.name));
		}
	}
	for (const name of SOURCE_DIRS) {
		for (const path of await collectSourceFiles(join(root, name))) files.add(path);
	}

	const hash = createHash('sha256');
	const existing = [...files].sort();
	let count = 0;
	for (const path of existing) {
		let data: Buffer;
		try {
			data = await readFile(path);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
			throw error;
		}
		const name = relative(root, path).split(sep).join('/');
		hash.update(name).update('\0').update(data).update('\0');
		count++;
	}

	for (const [name, value] of Object.entries(process.env)
		.filter(([key]) => key.startsWith('PUBLIC_') || key.startsWith('VITE_'))
		.sort(([a], [b]) => a.localeCompare(b))) {
		hash
			.update(name)
			.update('\0')
			.update(value ?? '')
			.update('\0');
	}

	return {
		version: 1,
		fingerprint: hash.digest('hex'),
		generatedAt: new Date().toISOString(),
		sourceFiles: count
	};
}

export async function getPreviewStatus(root = REPO_ROOT, previewRoot = PREVIEW_ROOT) {
	const current = join(previewRoot, 'releases', 'current');
	let manifest: PreviewManifest;
	try {
		manifest = JSON.parse(await readFile(join(current, MANIFEST_NAME), 'utf8')) as PreviewManifest;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {
				status: 'missing' as const,
				previewUrl: process.env.PREVIEW_URL ?? null
			};
		}
		throw error;
	}

	const latest = await fingerprintSources(root);
	return {
		status: latest.fingerprint === manifest.fingerprint ? ('fresh' as const) : ('stale' as const),
		builtAt: manifest.generatedAt,
		sourceFiles: latest.sourceFiles,
		previewUrl: process.env.PREVIEW_URL ?? null
	};
}

function availableMemoryMiB(): number | undefined {
	try {
		const meminfo = readFileSync('/proc/meminfo', 'utf8');
		const available = meminfo.match(/^MemAvailable:\s+(\d+)\s+kB$/m);
		return available ? Number(available[1]) / 1024 : undefined;
	} catch {
		return undefined;
	}
}

function result(data: Record<string, unknown>): void {
	console.log(`PREVIEW_RESULT ${JSON.stringify(data)}`);
}

export async function buildPreview(
	root = REPO_ROOT,
	previewRoot = PREVIEW_ROOT
): Promise<{
	status: 'fresh' | 'built';
	previewUrl: string | null;
	builtAt?: string;
}> {
	const resolvedRoot = resolve(root);
	const resolvedPreview = resolve(previewRoot);
	if (isWithin(resolvedRoot, resolvedPreview)) {
		throw new Error('MOUMY_PREVIEW_DIR must be outside the recipe repository.');
	}

	const status = await getPreviewStatus(resolvedRoot, resolvedPreview);
	if (status.status === 'fresh') {
		const fresh = { status: 'fresh' as const, previewUrl: status.previewUrl };
		result(fresh);
		return fresh;
	}

	const minimumMiB = Number(process.env.MOUMY_PREVIEW_MIN_AVAILABLE_MIB ?? '2800');
	if (!Number.isFinite(minimumMiB) || minimumMiB < 0) {
		throw new Error('MOUMY_PREVIEW_MIN_AVAILABLE_MIB must be a non-negative number.');
	}
	const availableMiB = availableMemoryMiB();
	if (availableMiB !== undefined && availableMiB < minimumMiB) {
		throw new Error(
			`Not enough available memory to build preview (${Math.floor(availableMiB)} MiB available; ${minimumMiB} MiB required). The previous preview is unchanged.`
		);
	}

	await mkdir(resolvedPreview, { recursive: true, mode: 0o750 });
	const lockPath = join(resolvedPreview, 'build.lock');
	const lockFile = await open(lockPath, 'a', 0o600);
	try {
		await lockFile.chmod(0o600);
	} finally {
		await lockFile.close();
	}
	const workerPath = fileURLToPath(new URL('./preview-worker.ts', import.meta.url));
	const flock = spawn(
		process.env.MOUMY_PREVIEW_FLOCK ?? 'flock',
		[
			'--exclusive',
			'--nonblock',
			'--no-fork',
			'--conflict-exit-code',
			'75',
			lockPath,
			process.execPath,
			workerPath,
			resolvedRoot,
			resolvedPreview
		],
		{ cwd: resolvedRoot, stdio: 'inherit' }
	);
	const exitCode = await new Promise<number>((resolveExit, reject) => {
		flock.once('error', reject);
		flock.once('exit', (code, signal) => {
			if (signal) reject(new Error(`Preview build stopped by signal ${signal}.`));
			else resolveExit(code ?? 1);
		});
	});
	if (exitCode === 75) throw new Error('A preview build is already running.');
	if (exitCode !== 0) throw new Error(`Static preview build failed with exit code ${exitCode}.`);
	return {
		status: 'built',
		previewUrl: process.env.PREVIEW_URL ?? null
	};
}

async function main(): Promise<void> {
	const [command] = process.argv.slice(2);
	if (command === 'status') {
		const status = await getPreviewStatus();
		result(status);
		return;
	}
	if (command === 'build') {
		try {
			await buildPreview();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`PREVIEW_STATE ${JSON.stringify({ status: 'failed', message })}`);
			result({
				status: 'failed',
				message,
				previewUrl: process.env.PREVIEW_URL ?? null
			});
			process.exitCode = 1;
		}
		return;
	}
	console.error('Usage: bun run scripts/preview.ts <status|build>');
	process.exitCode = 2;
}

if (import.meta.main) await main();
