# Moumy's Recipes

> A digital archive of handwritten family recipes — keeping my grandmother's cooking alive, one page at a time.

This project is a tribute to **Moumy**, my grandmother. It preserves her handwritten recipe notebooks as a static website — her looping cursive, her crossed-out corrections, the butter stains on the margins. All of it.

## Why this exists

Some recipes are passed down by making them together. Moumy's were written in old notebooks, in her hand, with her own notes in the margins. This site keeps those pages from fading — not by transcribing them into a database, but by letting her handwriting stay front and center.

Every recipe page shows her original manuscript scan alongside the typed version, so you can read it the way she wrote it.

## What you'll find

- **15 handwritten recipes** (and growing) — desserts, main courses, preserves
- **Manuscript scans** — the actual pages from her notebooks
- **A quiet, warm interface** — designed to feel like flipping through a kitchen drawer

## Tech

| Layer     | Stack                              |
| --------- | ---------------------------------- |
| Framework | SvelteKit 2 + Svelte 5             |
| UI        | Skeleton UI v4 + Tailwind v4       |
| Content   | mdsvex (Markdown → Svelte)         |
| Fonts     | Crimson Pro, Playfair, Great Vibes |
| Build     | Static (`adapter-static`)          |
| Deploy    | Cloudflare Pages                   |

The deployed site has no server-side runtime, database, or auth: Cloudflare Pages serves static HTML built from Markdown and manuscript images. The optional Atlas authoring preview builds that same static output on demand and serves only the published files from a loopback-only lightweight server; it does not change the public deployment.

## Reproducible toolchain

The project pins Bun to `1.4.2` in `.bun-version` and `packageManager`, and Node.js to `22.23.5` in `.node-version` and `engines`. CI uses these same versions, installs only from `bun.lock`, and runs checks, tests, lint, and the static build. Configure the Cloudflare Pages build environment with `BUN_VERSION=1.4.2` and `NODE_VERSION=22.23.5`; the Cloudflare project settings are external to this repository and must be kept in sync with these pins.

Dependency review and compatibility notes are recorded in [`docs/dependency-audit.md`](docs/dependency-audit.md).

## Adding recipes

1. Create a `.md` file in `src/data/recettes/` (see `ObsTemplate/recette.md` for the frontmatter schema)
2. Drop the manuscript scan in `src/data/img/`
3. Build — that's it

## Atlas authoring preview

The preview helper is intended for the shared local checkout on Atlas; it does not pull, reset, or publish Git changes.

```sh
bun run preview:status # Check whether the published preview matches local sources
bun run preview:build  # Build on demand, preserve the prior output on failure
bun run preview:serve  # Serve the current output on loopback (127.0.0.1:4175)
bun run test:preview   # Run preview pipeline and static-server tests
```

See [`docs/atlas-preview.md`](docs/atlas-preview.md) for the manifest, atomic publication, systemd/Tailscale setup, resource guard, permissions, and release-retention policy. The service/Tailscale configuration is not installed or exposed automatically. The separate editor button integration is tracked in [lelabdev/moumy-editor#35](https://github.com/lelabdev/moumy-editor/issues/35).

## License

MIT
