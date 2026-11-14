# Dependency and runtime audit

**Reviewed:** 2026-11-14

**Scope:** direct and locked Bun dependencies, declared package licenses, the SvelteKit static build, and the Node/Bun toolchain used for validation.

## Toolchain and compatibility

| Component                  | Pinned version      | Compatibility decision                                                                          |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| Bun                        | `1.4.2`             | Pinned in `.bun-version`, `packageManager`, and CI.                                             |
| Node.js                    | `22.23.5`           | Pinned in `.node-version` and `engines`; satisfies the Vite 8 and jsdom 31 engine requirements. |
| SvelteKit                  | `2.70.4`            | Stay on major 2; do not migrate to Kit 3 in this dependency-only change.                        |
| Svelte                     | `5.57.3`            | Stay on major 5.                                                                                |
| `@sveltejs/adapter-static` | `3.0.11`            | Stay on adapter major 3 with SvelteKit 2; no Node adapter or SSR runtime was added.             |
| Vite / Svelte Vite plugin  | `8.3.8` / `7.3.1`   | Updated within the existing majors and validated by the production static build.                |
| Tailwind CSS               | `4.3.5`             | Stay on major 4.                                                                                |
| Skeleton UI                | `4.15.2`            | Stay on major 4; version 5 is a migration, not a compatible patch update.                       |
| Vitest / jsdom             | `4.1.12` / `31.0.1` | Vitest tests use an explicit jsdom dependency; both support the pinned Node runtime.            |

The direct package ranges were refreshed within their existing major versions. Unused `@vitest/browser-playwright`, `playwright`, and `vitest-browser-svelte` dependencies were removed; this repository has no browser-mode Vitest configuration. `bun.lock` was regenerated with Bun 1.4.2 and verified using `bun install --frozen-lockfile`.

There are no duplicate direct dependencies. `bun pm ls --all` reports 14 package names with multiple versions in the transitive graph; these are retained where separate dependency/peer ranges resolve different versions (for example, `minimatch` 10/11 and `postcss-selector-parser` 6/7). The full list can be rechecked with `bun pm ls --all`; the two packages with multiple versions that have audit findings are detailed below.

The static adapter remains the production architecture. The checked build generated all **135 recipe pages** and sitemap entries. No `adapter-node` dependency or SSR migration was introduced.

## Tests and lint

Vitest is configured with jsdom and `test:unit` now runs once in CI rather than entering watch mode. The initial unit suite covers recipe metadata and slug loading, recipe lookup/body/steps, documents versus recipe categories, ingredient normalization/search, and slugification. It also caught and fixed a real data edge case: blank recipe excerpts parse as `null`, so recipe loading now normalizes excerpts and missing ingredient lists before search.

`prettier` now points Tailwind class sorting at the existing `src/app.css` instead of a nonexistent `src/routes/layout.css`. Prettier intentionally ignores the archival `AGENTS.md`, Obsidian template, and handwritten Markdown recipe/copy files to avoid rewriting editorial content; application code, configuration, docs, and tests remain checked. ESLint issues exposed by enabling the full lint command were fixed without changing the visual design.

## Vulnerability review

`bun audit` checked the resolved dependency graph. There are **no high or critical advisories**; `bun audit --audit-level=high` passes and is part of CI. The full audit still reports six low/moderate advisories across these five packages:

| Package                          | Severity | Advisory                                 | Why it remains                                                                                                                                                                         |
| -------------------------------- | -------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sveltejs/kit` 2.70.4           | Low (2)  | GHSA-pfhg-q3qv-9q6r; GHSA-27mw-82g8-phjj | Advisories mark all Kit 2 releases affected; resolution requires the major Kit 3 migration. The deployed application is static and does not run a Kit server or remote form functions. |
| `cookie` 0.6.0                   | Low      | GHSA-pxg6-pf52-xh8x                      | Pinned by Kit 2's `^0.6.0` range; the site has no request-time cookie runtime.                                                                                                         |
| `deepmerge` 4.3.1                | Low      | GHSA-gcqx-w48w-w2h4                      | Required by the Svelte Vite plugin's `^4.3.1` range; used during build/configuration, not by the published static site.                                                                |
| `minimatch` 10.2.6               | Moderate | GHSA-g3hv-75wg-m249                      | Required by the current ESLint/TypeScript-ESLint ranges; the patched version is major 11, outside those ranges. Development tooling only.                                              |
| `postcss-selector-parser` 6.0.10 | Moderate | GHSA-rj75-hqrm-r3gf                      | `@tailwindcss/typography` pins this 6.0.10 release; the fixed 6.x version is not yet allowed by that dependency. Build-time tooling only.                                              |

These transitive findings are recorded rather than forcing incompatible major-version overrides. Re-run the full audit when the upstream dependency ranges change. The CI threshold deliberately blocks high/critical findings while leaving the documented lower-severity upstream items visible for follow-up.

## License review

`bun pm licenses --json` found eight declared license identifiers among installed packages, with no unknown/unlicensed entries:

- MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, BlueOak-1.0.0
- MPL-2.0 (`lightningcss` and its platform packages)
- OFL-1.1 (the three bundled font families)

Preserve the upstream notices when redistributing those dependencies or generated font assets. Bun reported six lockfile packages not installed for the current Linux platform; those optional/platform-specific entries were therefore not represented in the local installed-package license scan.

## CI and Cloudflare Pages

The new GitHub Actions workflow pins the same Node and Bun versions, performs a frozen-lockfile install, checks the high/critical audit threshold, and runs type checking, unit and preview tests, lint, and the static production build.

Cloudflare Pages project settings are external to this repository and could not be inspected from the local checkout. Configure both the preview and production environments with `NODE_VERSION=22.23.5` and `BUN_VERSION=1.4.2` to match the committed pins; the repo CI validates the build command and static adapter but does not deploy or change the Cloudflare settings.
