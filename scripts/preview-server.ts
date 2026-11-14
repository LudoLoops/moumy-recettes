import { realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

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

function isWithin(parent: string, child: string): boolean {
	const path = relative(parent, child);
	return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
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
	root = process.env.MOUMY_PREVIEW_SERVE_ROOT ??
		(process.env.MOUMY_PREVIEW_DIR
			? join(process.env.MOUMY_PREVIEW_DIR, 'releases', 'current')
			: join(
					process.env.HOME ?? '/nonexistent',
					'.local',
					'share',
					'moumy-preview',
					'releases',
					'current'
				)),
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
