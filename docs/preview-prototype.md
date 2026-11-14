# Preview strategy prototype

**Date:** 2026-11-14

**Scope:** compare the existing static build with a temporary SvelteKit SSR build for local preview. No production deployment settings or recipe assets were changed.

## Findings from the Svelte check

The eight reported TypeScript errors were real component/API typing errors (two each in Accordion and Progress, one each in Icon consumers, RadioGroup, and the view-transition promise):

- Skeleton Svelte v4 exposes `Accordion` and `Progress` themselves as the root components, with compound parts such as `Item` and `Track` attached. It does not expose `.Root`; use `<Accordion>` and `<Progress>`.
- `Icon.svelte` did not declare/forward a `style` prop, although its alert callers supply one. Declare and apply `style` to the wrapper.
- Segmented-control `onValueChange` can deliver `value: null`. Do not assert it is always a string; retain the current selection for null.
- The promise resolver in `+layout.svelte` needs the `void` type parameter under the installed TypeScript definitions.

All eight errors are in source and should be fixed; they are not lint-only. Those fixes are included with this audit. The unrelated `tabular-nums` CSS declaration was also corrected to `font-variant-numeric: tabular-nums`.

After the changes, `bun run check` reports **0 errors and 0 warnings**.

## Prototype method

- Built the same 135-recipe project with the current static adapter and with a temporary `@sveltejs/adapter-node` v5.2.12 configuration. The adapter's v6 release targets SvelteKit 3 and could not be used with this project's SvelteKit 2; v5 was used instead.
- Temporarily disabled prerender flags only for the SSR experiment, then restored all config and route files. No adapter-node dependency or package/lockfile change was retained.
- Sampled the build process tree's aggregate resident memory from `/proc` every 100 ms. This is a peak-RSS estimate, not a heap measurement; very short-lived peaks may be missed.
- Measured server idle RSS for 10 seconds (100 samples) after one request to `/recettes/BrA147_A`.
- Tested a changed recipe title without rebuilding the SSR output, then after rebuilding the static output. The temporary recipe edit was reverted and the final static site rebuilt.

## Results

| Preview path                          | Build elapsed | Peak build RSS |                          Idle server RSS | Reflects source edit without rebuild?                |
| ------------------------------------- | ------------: | -------------: | ---------------------------------------: | ---------------------------------------------------- |
| Static adapter (`bun run build`)      |   14.9–15.4 s |  1.62–1.66 GiB | ~23 MiB with Python's static HTTP server | No; a rebuild updates the HTML                       |
| SSR adapter-node v5 (`bun run build`) |        16.8 s |       1.71 GiB |                                  ~82 MiB | No; compiled recipe metadata remains from build time |

A SvelteKit `vite preview` process was also measured at ~239 MiB idle, but this is a preview/dev-serving process, not a suitable lightweight static file server, so it is excluded from the comparison table.

**Behavior check:** after changing `BrA147_A.md` to `Gâteau Prototype Live` without rebuilding, the compiled SSR server still rendered `Gâteau à l'Orange`. A static rebuild rendered `Gâteau Prototype Live` in the output HTML. The original source was restored afterward.

Numbers are indicative measurements from this machine, a single run per path (apart from repeated static builds), and an unoptimized local build. They are not a production load test. The static server number is Python's small HTTP server, not a selected editor's server implementation.

## Recommendation

Prefer **static rebuild on demand** for the local editor preview, served by a small static HTTP server. The observed rebuild takes roughly 15 seconds and peaks around 1.6 GiB, which is a noticeable save-to-preview delay, but avoids resident SSR memory and—more importantly—avoids a substantial runtime-content refactor.

Changing only the adapter to SSR does not make the content dynamic: recipe metadata, mdsvex body components, raw Markdown, editorial copy, categories, and manuscript images are imported through eager build-time globs. A genuine live SSR preview would additionally need runtime Markdown/frontmatter parsing, runtime data/content/image discovery, revised prerender behavior, and compatibility tests. The prototype confirms the compiled SSR route itself works, but it fails the central preview requirement of reflecting file edits without a rebuild. Keep the public Cloudflare site static; consider incremental optimization of preview rebuild latency separately if ~15 seconds proves unacceptable in editor use.
