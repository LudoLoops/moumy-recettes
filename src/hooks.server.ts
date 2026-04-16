import { createChildLogger } from '$lib/logger';
import type { Handle } from '@sveltejs/kit';

const isDev = import.meta.env.DEV;

const CSP_HEADER = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
	"worker-src 'self' blob:",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self'",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"frame-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	'block-all-mixed-content',
	'upgrade-insecure-requests'
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
	const logger = createChildLogger({
		requestId: crypto.randomUUID(),
		path: event.url.pathname,
		method: event.request.method
	});

	const start = Date.now();

	try {
		const response = await resolve(event);

		logger.info({
			method: event.request.method,
			url: event.url.pathname,
			status: response.status,
			duration: Date.now() - start
		});

		const headers = new Headers(response.headers);
		headers.set('Content-Security-Policy', CSP_HEADER);
		headers.set('X-Content-Type-Options', 'nosniff');
		headers.set('X-Frame-Options', 'DENY');
		headers.set('X-XSS-Protection', '1; mode=block');
		headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

		if (event.url.protocol === 'https:') {
			headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
		}
		headers.delete('x-sveltekit-page');

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	} catch (error) {
		logger.error({ error: (error as Error).message });
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
