/**
 * Theme store - Svelte 5 rune-based theme management
 * Uses Skeleton's native data-mode attribute for dark/light mode
 */

const THEME_KEY = 'svelteforge-theme';

let isDark = $state(false);
let initialized = false;

function initTheme() {
	if (initialized || typeof window === 'undefined') return;
	initialized = true;

	const stored = localStorage.getItem(THEME_KEY);
	if (stored) {
		isDark = stored === 'dark';
	} else {
		isDark = false;
	}
	applyTheme();
}

function applyTheme() {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light');
}

function toggleTheme() {
	isDark = !isDark;
	localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
	applyTheme();
}

export const themeStore = {
	get isDark() {
		return isDark;
	},
	init: initTheme,
	toggle: toggleTheme,
	destroy: () => {
		initialized = false;
	}
};
