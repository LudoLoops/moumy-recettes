# AGENTS.md — Les recettes de Moumy

> Static recipe tribute website for a grandmother — handwritten family recipes, archived forever. No server, no database, no auth. Just markdown → static HTML.

## Quick Reference

| Category         | Convention                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Package Manager  | `bun`                                                                      |
| Framework        | SvelteKit 2 + Svelte 5 (runes mode)                                       |
| Adapter          | `@sveltejs/adapter-static` (Cloudflare Pages)                              |
| UI Library       | Skeleton UI v4 (`@skeletonlabs/skeleton`)                                  |
| CSS              | Tailwind v4 + Skeleton theme tokens                                        |
| Content          | mdsvex (`.md` recipe files) compiled at build time                         |
| Fonts            | Crimson Pro (body), Playfair Display (headings), Great Vibes (handwriting) |
| Content Language | French (recipes & UI copy) / English (code comments)                       |
| Deployment       | Cloudflare Pages (`bun run build` → `build/` directory)                    |

## Commands

```bash
bun dev              # Start dev server (with --host)
bun run build        # Production build → static files in build/
bun run preview      # Preview production build locally
bun run check        # TypeScript type check
bun run lint         # ESLint + Prettier check
bun run format       # Format code
bun run test:unit    # Run Vitest tests
```

## Project Structure

```
src/
├── app.css                          ← Global CSS (imports: fonts, tailwind, skeleton, theme, tokens)
├── app.html                         ← HTML shell
├── app.d.ts                         ← Type declarations
├── data/
│   ├── recettes.ts                  ← mdsvex loader (getAllRecipes, getRecipeBySlug, etc.)
│   ├── recettes/                    ← 15 .md recipe files (growing)
│   └── img/                         ← Manuscript scan images (11 JPGs)
├── lib/
│   ├── assets/                      ← Favicon
│   ├── components/
│   │   ├── layout/                  ← Navbar, Footer
│   │   ├── ui/                      ← Skeleton-style UI components (Card, Badge, Button, Modal, etc.)
│   │   ├── RecipeBrowser.svelte     ← Search + filter + recipe grid
│   │   ├── ManuscriptImage.svelte   ← Recipe manuscript scan viewer
│   │   └── LetterNav.svelte         ← Alphabetical letter navigation
│   ├── data/
│   │   └── content.json             ← All UI copywriting (French text for every page)
│   ├── styles/
│   │   ├── svelteForge.css          ← Skeleton theme (palette, pill buttons, whisper borders)
│   │   ├── tokens.css               ← Design tokens (shadows, spacing, Moumy colors)
│   │   └── fonts.css                ← Fontsource imports
│   ├── types.ts                     ← Shared TypeScript types
│   └── utils/                       ← Utility functions (slugify, formatters, theme, focus-trap)
├── routes/
│   ├── +layout.svelte               ← Root layout (Navbar/Footer conditionals)
│   ├── +layout.ts                   ← prerender = true
│   ├── +page.svelte                 ← Homepage (hero, quote, recipe grid, souvenirs)
│   ├── +page.server.ts              ← Homepage data loader
│   ├── layout.css                   ← Layout-specific styles
│   ├── recettes/
│   │   ├── +page.svelte             ← Recipe listing (RecipeBrowser component)
│   │   ├── +page.server.ts          ← Recipe data loader
│   │   └── [slug]/
│   │       ├── +page.svelte         ← Full recipe (2-col: manuscript + content)
│   │       ├── +page.server.ts      ← Load recipe by slug
│   │       └── +page.ts             ← prerender = true
│   ├── ingredients/
│   │   ├── +page.svelte             ← Ingredients index (alphabetical letter groups)
│   │   ├── +page.server.ts          ← Ingredients data loader
│   │   └── +page.ts                 ← prerender = true
│   ├── (legal)/                     ← Legal pages (legal, privacy)
│   │   ├── +layout.svelte
│   │   ├── legal/+page.svelte
│   │   └── privacy/+page.svelte
│   └── +error.svelte                ← Error page
├── lib/components/ui/               ← Skeleton UI components
└── lib/components/ui/utils/cn.ts    ← Tailwind class merge utility (clsx + tailwind-merge)
```

## Static Site Architecture

This is a **fully static site** — no server runtime, no API routes, no database, no authentication.

- **Adapter**: `@sveltejs/adapter-static` with `prerender: { handleHttpError: 'warn' }`
- **Build**: `bun run build` → static HTML/CSS/JS in `build/`
- **Deploy**: Cloudflare Pages picks up the `build/` directory
- **Data loading**: `+page.server.ts` files exist only for SvelteKit's load API — they run at **build time** during prerendering, not at runtime
- **Content pipeline**: `.md` files → mdsvex → Svelte components → static HTML

## Copywriting — `src/lib/data/content.json`

All user-facing French text lives in `content.json` (no hardcoded strings in components):

| Section           | Contains                                          |
| ----------------- | ------------------------------------------------- |
| `landing.hero`    | Homepage hero title, subtitle, description, badge |
| `landing.quote`   | Moumy quote + attribution                         |
| `landing.familyMemories` | Souvenirs section text + stats labels    |
| `recipeDetail`    | Labels: back, ingredients, preparation, notes, meta, actions |
| `browser`         | Search placeholder, empty states, ingredient index title |
| `footer`          | Brand, description, closing, copyright            |
| `nav`             | Brand name, nav links                             |

**Rule**: If you need to add or change any visible French text, edit `content.json` — not the `.svelte` files.

## Recipe Content

### Recipe Files

Recipes live in `src/data/recettes/` as `.md` files. Filenames become slugs (e.g. `BrA147_A.md` → slug `BrA147_A`).

Manuscript scan images live in `src/data/img/` (referenced in frontmatter).

### Obsidian Template

`ObsTemplate/recette.md` is the Obsidian template for creating new recipes from Moumy's handwritten notebooks. It has the complete frontmatter skeleton with numbered step placeholders.

### Recipe Frontmatter Schema

```yaml
---
title: 'Gâteau à l\'orange'       # Required — displayed as H1
slug: 'BrA147'                     # Optional — derived from filename if absent
manuscript: ''                     # Path to scan image (empty = placeholder shown)
category: 'desserts'               # Machine key for filtering
categoryLabel: 'Desserts'          # Display label (capitalized)
excerpt: 'Un moelleux...'          # Short summary for cards
prepTime: 15                       # Preparation time (minutes, number)
cookTime: 35                       # Cooking time (minutes, number)
servings: 8                        # Yield (number)
difficulty: 'Facile'               # Facile / Moyen / Difficile
ingredients:                       # List of ingredient strings
  - '250g de farine'
  - '125g de beurre mou'
notes: "Remplacer les oranges par des citrons."  # Moumy's personal tips
---
```

### Body Format

Numbered steps as plain text (NOT markdown list). mdsvex renders them as paragraphs:

```
1. Mélanger en crème le beurre et le sucre.
2. Ajouter les œufs entiers en battant la pâte.
3. Verser dans un moule beurré et cuire à four modéré.
```

### Adding New Recipes

1. Copy `ObsTemplate/recette.md` or create a new `.md` file in `src/data/recettes/`
2. Fill in the frontmatter (follow schema above)
3. Write numbered preparation steps as the body
4. Add manuscript scan image to `src/data/img/` if available, set `manuscript` field
5. **No code changes needed** — recipes auto-load via `import.meta.glob({ eager: true })`

### Data Loader API (`src/data/recettes.ts`)

| Function                   | Returns                                             |
| -------------------------- | --------------------------------------------------- |
| `getAllRecipes()`          | All recipes sorted by title (French locale)         |
| `getRecipeBySlug(slug)`    | Single recipe or undefined                          |
| `getRecipeBody(slug)`      | mdsvex component for recipe body rendering          |
| `getAllIngredients()`      | All unique ingredients grouped alphabetically       |
| `getCategories()`          | All unique categories with counts                   |
| `searchRecipes(query)`     | Recipes matching query in title/excerpt/ingredients |
| `searchIngredients(query)` | Ingredients matching query                          |

## Design System Rules (MANDATORY)

### Skeleton UI v4

- **Always use Skeleton components/wrappers** — never build custom UI when Skeleton provides it
- **Never duplicate Skeleton functionality** with custom CSS or custom props

### Typography — Skeleton Handles Everything (CRITICAL)

The Skeleton theme (`svelteForge.css`) already defines font families, weights, colors, and line-heights. These apply automatically to semantic HTML elements and switch between light/dark mode.

**Headings** (`<h1>`–`<h6>`) automatically get:

- `--heading-font-family` → Playfair Display
- `--heading-font-weight` → bold
- `--base-font-color` / `--base-font-color-dark` → auto light/dark switch
- `--text-scaling: 1.1` → sizes scaled proportionally

**Body text** (`<p>`, `<span>`, `<div>`, etc.) automatically gets:

- `--base-font-family` → Crimson Pro
- `--base-font-color` / `--base-font-color-dark` → auto light/dark switch
- `--base-line-height` → 1.8

```html
<!-- ✅ CORRECT — just use semantic HTML, add only layout classes -->
<h1 class="mt-4 mb-2">{recipe.title}</h1>
<p class="mb-6 italic">{recipe.excerpt}</p>

<!-- ❌ WRONG — don't re-specify what the theme already provides -->
<h1 class="text-4xl font-bold text-surface-950" style="font-family: var(--font-title)">
	{recipe.title}
</h1>
<p class="text-lg text-surface-700" style="font-family: var(--font-body)">{recipe.excerpt}</p>
```

**Rules:**

- **NEVER** add `style="font-family: var(--font-title)"` on headings — Skeleton does this
- **NEVER** add `font-bold` / `font-weight: bold` on headings — Skeleton does this
- **NEVER** add `text-surface-950` or any color class on headings for body text color — Skeleton handles light/dark switching via `--base-font-color` / `--base-font-color-dark`
- **NEVER** hardcode `oklch(...)` colors anywhere — use Skeleton color tokens or Tailwind classes
- Only add Tailwind classes for **layout** (spacing, grid, margin, padding, flex)

### Color Pairings (CRITICAL)

NEVER use `dark:` prefix for light/dark variants. Use Skeleton pairings format:

```
{property}-{color}-{lightShade}-{darkShade}
```

Valid pairs: `50↔950`, `100↔900`, `200↔800`, `300↔700`, `400↔600`, `500↔500`

```html
<!-- ✅ CORRECT -->
<p class="text-surface-900-100">Text</p>
<div class="bg-primary-50-950">Box</div>

<!-- ❌ WRONG -->
<p class="text-neutral-800 dark:text-neutral-200">Text</p>
<div class="bg-white dark:bg-gray-900">Box</div>
```

### Theme Color Tokens

Use Skeleton semantic tokens, NOT raw Tailwind colors:

| Token       | Usage                                 | Tailwind Classes                       |
| ----------- | ------------------------------------- | -------------------------------------- |
| `surface`   | Backgrounds, cards, text              | `bg-surface-*`, `text-surface-*`       |
| `primary`   | Warm brown — accents, links, nav text | `text-primary-700-300`, `bg-primary-*` |
| `secondary` | Gold — badges, highlights             | `text-secondary-*`, `bg-secondary-*`   |
| `tertiary`  | Subtle backgrounds                    | `bg-tertiary-*`                        |
| `success`   | Positive states                       | `text-success-*`, `bg-success-*`       |
| `warning`   | Caution states                        | `text-warning-*`, `bg-warning-*`       |
| `error`     | Error states                          | `text-error-*`, `bg-error-*`           |

```html
<!-- ✅ CORRECT — Skeleton color pairing -->
<div class="bg-surface-100-900">
	<span class="text-primary-700-300">Nav link</span>
</div>

<!-- ❌ WRONG — raw Tailwind colors -->
<div class="bg-gray-100 dark:bg-gray-900">
	<span class="text-white">Nav link</span>
</div>
```

### Exception: Cards

`bg-white` IS allowed on Card components (matches reference design).

### Svelte 5 Conventions

- Use `{@render children()}` — NOT `<slot />`
- Use `onclick` — NOT `on:click`
- Use runes: `$state`, `$derived`, `$effect`, `$props()`
- Module context (`<script context="module">`) is deprecated in Svelte 5 — mdsvex generates warnings, these are cosmetic only (suppressed via `onwarn` in `svelte.config.js`)

### Design Tokens (`tokens.css`) — For Special Cases Only

Use `var(--token)` via inline `style` ONLY for things Tailwind/Skeleton don't cover. Color pairings stay as Tailwind classes.

| Token                                                                       | Usage                           | When to Use                           |
| --------------------------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| `--shadow-card` / `--shadow-deep` / `--shadow-hover` / `--shadow-focus`     | Multi-layer shadows             | Box shadows on custom containers      |
| `--space-section` / `--space-section-lg`                                    | Section spacing (5rem / 7.5rem) | Large vertical gaps between sections  |
| `--gap-xs` / `--gap-sm` / `--gap-md` / `--gap-lg` / `--gap-xl`              | Consistent gaps                 | When Skeleton gap utilities don't fit |
| `--color-cream`, `--color-warm-brown`, `--color-gold`, `--color-gold-light` | Moumy palette                   | Accents, borders, decorative elements |
| `--font-handwriting`                                                        | Great Vibes cursive             | Signature moments (hero title, notes) |
| `--radius-card`, `--radius-input-custom`                                    | Border radius                   | Custom containers                     |

### Custom CSS — Only When Tailwind Can't

Keep `<style>` blocks minimal. Only use custom CSS for:

| What                                               | Why                                      |
| -------------------------------------------------- | ---------------------------------------- |
| `::before` / `::after` pseudo-elements             | Tailwind can't target these              |
| `:global()` selectors                              | Styling mdsvex-rendered content          |
| `@keyframes` animations                            | Tailwind can't define custom keyframes   |
| `@media print`                                     | Print-specific overrides                 |
| Parent-child hover states (`.parent:hover .child`) | Tailwind's `group-hover` has limitations |

**NEVER** put in custom CSS what Tailwind already provides (colors, spacing, flex, grid, borders, radius, fonts, weights).

## Moumy-Specific Design Rules

### Colors

| Name       | Hex               | Usage                       |
| ---------- | ----------------- | --------------------------- |
| Cream      | `#FAF7F2`         | Page background, warm base  |
| Warm Brown | `#8B6F5C`         | Primary text, headings      |
| Gold       | `#C9A962`         | Accents, badges, highlights |
| Gold Light | gradient endpoint | Badge gradient              |

### Components

- **Buttons**: Pill-shaped via `--radius-base: 9999px` in theme
- **Cards**: White bg, NO border, soft multi-layer shadows (`--shadow-card`)
- **Badge gold variant**: `linear-gradient(135deg, gold → gold-light)`, uppercase, `letter-spacing: 0.5px`

### Images

- **Only ONE image per recipe**: the manuscript scan (handwritten recipe)
- No Unsplash photos. No stock images. No images on homepage cards.
- Manuscript path in frontmatter: `manuscript: "/images/manuscripts/filename.jpg"` (or empty for placeholder)
- Manuscript scans stored in `src/data/img/`

### Layout

- **Navbar**: visible everywhere EXCEPT on landing page (`/`)
- **Footer**: visible everywhere EXCEPT on recipe detail pages (`/recettes/[slug]`)
- **Landing page (`/`)**: hero + citation + recipe grid + souvenirs — no navbar
- **Recipe listing (`/recettes`)**: search + filters + recipe grid — navbar visible
- **Recipe detail (`/recettes/[slug]`)**: full recipe (2-col: manuscript + content) — navbar visible, no footer
- **Ingredients (`/ingredients`)**: alphabetical ingredient index — navbar visible

## Dev Tools

### Windows Launcher — `moumy start.bat`

A convenience batch file for Ludo's dad to start the dev server on Windows. It:
1. Checks if `bun` is installed
2. Opens `http://localhost:5173` in the browser
3. Runs `bun dev`

### Obsidian Template — `ObsTemplate/recette.md`

Template for creating new recipes from Moumy's handwritten notebooks in Obsidian. Contains the complete frontmatter skeleton and numbered step placeholders.

## Known Issues

- **mdsvex + Svelte 5**: Generates `context="module"` deprecation warnings — suppressed via `onwarn` in `svelte.config.js`
- **Build 404 on `/favicon.ico`**: Prerender may warn on missing favicon — handled via `handleHttpError: 'warn'`

## Key Files

| File                                      | Purpose                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `svelte.config.js`                        | SvelteKit config (static adapter, mdsvex, runes, prerender)     |
| `src/lib/styles/svelteForge.css`          | Skeleton theme configuration                                    |
| `src/lib/styles/tokens.css`               | Design tokens (shadows, spacing, colors)                        |
| `src/lib/styles/fonts.css`                | Fontsource imports (Crimson Pro, Playfair Display, Great Vibes) |
| `src/data/recettes.ts`                    | Recipe data loader (mdsvex + import.meta.glob)                  |
| `src/data/recettes/*.md`                  | Recipe content files (15 recipes, growing)                      |
| `src/data/img/*.jpg`                      | Manuscript scan images                                          |
| `src/lib/data/content.json`               | All UI copywriting text (French)                                |
| `src/routes/+layout.svelte`               | Root layout (Navbar/Footer conditionals)                        |
| `src/routes/+page.svelte`                 | Homepage (hero, quote, grid, souvenirs)                         |
| `src/routes/recettes/+page.svelte`        | Recipe listing (RecipeBrowser component)                        |
| `src/routes/recettes/[slug]/+page.svelte` | Individual recipe page                                          |
| `src/routes/ingredients/+page.svelte`     | Ingredients index (alphabetical)                                |
| `ObsTemplate/recette.md`                  | Obsidian template for new recipes                               |
| `moumy start.bat`                         | Windows dev launcher for Ludo's dad                             |
