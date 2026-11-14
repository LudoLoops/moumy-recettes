#!/usr/bin/env bun
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
	mkdir,
	open,
	readdir,
	realpath,
	readFile,
	rename,
	rm,
	stat,
	symlink,
	writeFile
} from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PREVIEW_ROOT = resolve(
	process.env.MOUMY_PREVIEW_DIR ?? join(homedir(), '.local', 'share', 'moumy-preview')
);
const CURRENT_LINK = join(PREVIEW_ROOT, 'current');
const MANIFEST_NAME = '.moumy-preview-manifest.json';
const SOURCE_DIRS = ['src', 'static', 'scripts'];
const SOURCE_FILES = [
	'package.json',
	'bun.lock',
	'svelte.config.js',
	'vite.config.ts',
	'tsconfig.json',
	'.node-version'
];
const MIME_TYPES: Record<string, string> = {
	'.avif': 'image/avif',
	'.css': 'text/css; charset=utf-8',
	'.gif': 'image/gif',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml; charset=utf-8'
};

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
	const current = join(previewRoot, 'current');
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

async function acquireBuildLock(previewRoot: string): Promise<() => Promise<void>> {
	const lockPath = join(previewRoot, 'build.lock');
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const lock = await open(lockPath, 'wx', 0o600);
			await lock.writeFile(
				JSON.stringify({
					pid: process.pid,
					startedAt: new Date().toISOString()
				})
			);
			await lock.close();
			return async () => rm(lockPath, { force: true });
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
			let lockInfo: { pid?: number };
			try {
				lockInfo = JSON.parse(await readFile(lockPath, 'utf8')) as {
					pid?: number;
				};
			} catch (error) {
				throw new Error(`Preview build lock exists and is unreadable: ${lockPath}`, {
					cause: error
				});
			}
			if (!Number.isInteger(lockInfo.pid) || (lockInfo.pid ?? 0) <= 0) {
				throw new Error(`Preview build lock has no valid PID: ${lockPath}`, {
					cause: error
				});
			}
			try {
				process.kill(lockInfo.pid, 0);
			} catch (probeError) {
				if ((probeError as NodeJS.ErrnoException).code !== 'ESRCH') throw probeError;
				await rm(lockPath, { force: true });
				continue;
			}
			throw new Error(`A preview build is already running (pid ${lockInfo.pid}).`, {
				cause: error
			});
		}
	}
	throw new Error('Could not acquire preview build lock.');
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
	const releaseId = `${Date.now()}-${randomUUID()}`;
	const staging = join(resolvedPreview, `.staging-${releaseId}`);
	const buildOutput = join(staging, 'site');
	const release = join(resolvedPreview, 'releases', releaseId);
	let releasePublished = false;
	const releaseLock = await acquireBuildLock(resolvedPreview);

	try {
		const inputs = await fingerprintSources(resolvedRoot);
		console.log(
			`PREVIEW_STATE ${JSON.stringify({ status: 'building', totalInputs: inputs.sourceFiles })}`
		);
		await mkdir(staging, { recursive: true, mode: 0o750 });

		const build = spawn(process.execPath, ['run', 'build'], {
			cwd: resolvedRoot,
			stdio: 'inherit',
			env: { ...process.env, MOUMY_PREVIEW_BUILD_DIR: buildOutput }
		});
		const exitCode = await new Promise<number>((resolveExit, reject) => {
			build.once('error', reject);
			build.once('exit', (code, signal) => {
				if (signal) reject(new Error(`Build stopped by signal ${signal}.`));
				else resolveExit(code ?? 1);
			});
		});
		if (exitCode !== 0) throw new Error(`Static preview build failed with exit code ${exitCode}.`);
		for (const requiredFile of ['index.html', 'sitemap.xml']) {
			const info = await stat(join(buildOutput, requiredFile)).catch(() => undefined);
			if (!info?.isFile() || info.size === 0) {
				throw new Error(`Static build output is incomplete: missing or empty ${requiredFile}.`);
			}
		}

		const builtSources = await fingerprintSources(resolvedRoot);
		if (builtSources.fingerprint !== inputs.fingerprint) {
			throw new Error(
				'Source files changed while building; preview was not published. Run Preview again.'
			);
		}

		const manifest: PreviewManifest = {
			...builtSources,
			generatedAt: new Date().toISOString()
		};
		await writeFile(join(buildOutput, MANIFEST_NAME), JSON.stringify(manifest, null, 2), {
			mode: 0o640
		});
		await mkdir(join(resolvedPreview, 'releases'), {
			recursive: true,
			mode: 0o750
		});
		await rename(buildOutput, release);
		const nextLink = join(resolvedPreview, `.current-${releaseId}`);
		await symlink(relative(resolvedPreview, release), nextLink, 'dir');
		await rename(nextLink, join(resolvedPreview, 'current'));
		releasePublished = true;

		const complete = {
			status: 'built' as const,
			builtAt: manifest.generatedAt,
			previewUrl: process.env.PREVIEW_URL ?? null,
			sourceFiles: manifest.sourceFiles
		};
		result(complete);
		return complete;
	} finally {
		await releaseLock();
		await rm(staging, { recursive: true, force: true });
		if (!releasePublished) await rm(release, { recursive: true, force: true });
	}
}

export async function staticResponse(request: Request, rootPath: string): Promise<Response> {
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return new Response('Method not allowed', {
			status: 405,
			headers: { Allow: 'GET, HEAD' }
		});
	}

	let root: string;
	try {
		root = await realpath(rootPath);
	} catch {
		return new Response('Preview has not been built yet.', { status: 503 });
	}

	let pathname: string;
	try {
		pathname = new URL(request.url).pathname;
	} catch {
		return new Response('Bad request', { status: 400 });
	}
	const decoded = (() => {
		try {
			return decodeURIComponent(pathname);
		} catch {
			return null;
		}
	})();
	if (decoded === null || decoded.includes('\0') || decoded.includes('\\')) {
		return new Response('Bad request', { status: 400 });
	}

	const cleanPath = resolve('/', decoded).replace(/^\/+/, '');
	if (cleanPath.split('/').some((segment) => segment.startsWith('.'))) {
		return new Response('Not found', { status: 404 });
	}
	const paths =
		cleanPath === ''
			? [join(root, 'index.html')]
			: decoded.endsWith('/')
				? [join(root, `${cleanPath}.html`), join(root, cleanPath, 'index.html')]
				: [
						join(root, `${cleanPath}.html`),
						join(root, cleanPath, 'index.html'),
						join(root, cleanPath)
					];

	for (const path of paths) {
		if (!isWithin(root, path)) continue;
		try {
			const realPath = await realpath(path);
			if (!isWithin(root, realPath) || !(await stat(realPath)).isFile()) continue;
			const file = Bun.file(realPath);
			const headers = new Headers({
				'Cache-Control': 'no-store',
				'Content-Length': String(file.size),
				'Content-Type': MIME_TYPES[extname(realPath).toLowerCase()] ?? 'application/octet-stream',
				'X-Content-Type-Options': 'nosniff'
			});
			return new Response(request.method === 'HEAD' ? null : file, { headers });
		} catch (error) {
			if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
		}
	}

	return new Response('Not found', { status: 404 });
}

export function startPreviewServer(
	root = CURRENT_LINK,
	hostname = process.env.MOUMY_PREVIEW_HOST ?? '127.0.0.1',
	port = Number(process.env.MOUMY_PREVIEW_PORT ?? '4175')
) {
	if (hostname !== '127.0.0.1' && hostname !== '::1') {
		throw new Error(
			'Preview server must bind to loopback; expose it only through Tailscale Serve.'
		);
	}
	return Bun.serve({
		hostname,
		port,
		fetch: (request) => staticResponse(request, root)
	});
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
	if (command === 'serve') {
		const server = startPreviewServer();
		console.log(`Preview server listening on http://${server.hostname}:${server.port}`);
		return;
	}
	console.error('Usage: bun run scripts/preview.ts <status|build|serve>');
	process.exitCode = 2;
}

if (import.meta.main) await main();
