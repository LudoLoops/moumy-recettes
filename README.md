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

| Layer        | Stack                              |
| ------------ | ---------------------------------- |
| Framework    | SvelteKit 2 + Svelte 5 (runes)    |
| UI           | Skeleton UI v4 + Tailwind v4      |
| Content      | mdsvex (Markdown → Svelte)        |
| Fonts        | Crimson Pro, Playfair, Great Vibes |
| Build        | Static (`adapter-static`)         |
| Deploy       | Cloudflare Pages                   |

No server, no database, no auth. Just Markdown files and manuscript images compiled into static HTML.

## Adding recipes

1. Create a `.md` file in `src/data/recettes/` (see `ObsTemplate/recette.md` for the frontmatter schema)
2. Drop the manuscript scan in `src/data/img/`
3. Build — that's it

## License

MIT
