import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		alias: {
			$data: 'src/data'
		},
		prerender: {
			handleHttpError: 'warn'
		}
	},
	preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
	extensions: ['.svelte', '.svx', '.md'],
	onwarn(warning, handler) {
		// mdsvex generates `context="module"` which is deprecated in Svelte 5 — cosmetic only
		if (warning.code === 'script_context_deprecated') return;
		handler(warning);
	}
};

export default config;
