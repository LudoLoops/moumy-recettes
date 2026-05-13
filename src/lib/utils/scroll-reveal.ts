import type { Action } from 'svelte';

/**
 * Svelte action that reveals elements when they scroll into view.
 * Adds a CSS class when the element enters the viewport.
 */
export const scrollReveal: Action = (node, options?: { threshold?: number; class?: string }) => {
	const revealClass = options?.class ?? 'revealed';
	const threshold = options?.threshold ?? 0.1;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add(revealClass);
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold, rootMargin: '0px 0px -50px 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.unobserve(node);
		}
	};
};
