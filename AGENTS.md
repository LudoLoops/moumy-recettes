# AGENTS.md — Les recettes de Moumy

> Recipe tribute website for a grandmother — handwritten family recipes, archived forever.

## Quick Reference

| Category         | Convention                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Package Manager  | `bun`                                                                      |
| Framework        | SvelteKit + Svelte 5 (runes mode)                                          |
| UI Library       | Skeleton UI v4 (`@skeletonlabs/skeleton`)                                  |
| CSS              | Tailwind v4 + Skeleton theme tokens                                        |
| Markdown         | mdsvex (`.md` recipe files)                                                |
| Fonts            | Crimson Pro (body), Playfair Display (headings), Great Vibes (handwriting) |
| Content Language | French (recipes) / English (UI code comments)                              |

## Commands

```bash
bun dev              # Start dev server (with --host)
bun build            # Production build
bun check            # TypeScript type check
bun lint             # ESLint + Prettier check
bun format           # Format code
bun test:unit        # Run Vitest tests

```

## Project Structure

```
src/
├── app.css                          ← Global CSS (imports: fonts, tailwind, skeleton, theme, tokens)
├── hooks.server.ts                  ← BetterAuth server hooks
├── lib/
│   ├── auth.ts / auth-client.ts     ← BetterAuth config
│   ├── components/
│   │   ├── layout/                  ← Navbar, Footer, MobileMenu, NavLinks, AuthButtons
│   │   ├── ui/                      ← Card, Badge, Button, Modal, Tabs, Toast, etc.
│   │   └── icons/                   ← Lucide icon wrappers
│   ├── data/
│   │   ├── recipes.ts               ← mdsvex loader (getAllRecipes, getRecipeBySlug, etc.)
│   │   └── recipes/                 ← 8 .md recipe files (→ 200+ eventually)
│   ├── db/                          ← Drizzle ORM schema + migrations
│   ├── styles/
│   │   ├── svelteForge.css          ← Skeleton theme (palette, pill buttons, whisper borders)
│   │   ├── tokens.css               ← Design tokens (shadows, spacing, Moumy colors)
│   │   └── fonts.css                ← Fontsource imports
│   ├── schemas/                     ← Zod validation schemas
│   ├── services/                    ← Business logic services
│   ├── middleware/                   ← Auth middleware
│   └── utils/                       ← Utility functions
├── routes/
│   ├── +layout.svelte               ← Root layout (Navbar conditionally hidden, Footer)
│   ├── +page.svelte                 ← Homepage (hero, search, recipe cards)
│   ├── +page.server.ts              ← Homepage data loader
│   ├── recettes/                      ← Recipe pages
│   │   ├── +page.svelte               ← Recipe listing (search + filters + grid)
│   │   ├── +page.server.ts            ← Recipe data loader
│   │   └── [slug]/                    ← Individual recipe pages
│   │   ├── +page.server.ts          ← Load recipe by slug
│   │   ├── +page.ts                 ← prerender = true
│   │   └── +page.svelte             ← Full recipe (2-col: manuscript + content)
│   ├── ingredients/                 ← Ingredients index (alphabetical groups)
│   ├── (public)/                    ← Auth pages (login, signup, forgot/reset password)
│   ├── (protected)/                 ← Admin/authenticated pages
│   ├── (legal)/                     ← Legal pages
│   ├── api/                         ← API routes
│   └── layout.css                   ← Layout-specific styles
```

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

	<!-- ❌ WRONG — raw Tailwind colors -->
	<div class="bg-gray-100 dark:bg-gray-900">
		<span class="text-white">Nav link</span>
	</div>
</div>
```

### Exception: Cards

`bg-white` IS allowed on Card components (matches reference design).

### Svelte 5 Conventions

- Use `{@render children()}` — NOT `<slot />`
- Use `onclick` — NOT `on:click`
- Use runes: `$state`, `$derived`, `$effect`, `$props()`
- Module context (`<script context="module">`) is deprecated in Svelte 5 — mdsvex generates warnings, these are cosmetic only

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
- Manuscript path in frontmatter: `manuscript: "/images/manuscripts/filename.jpg"`
- If `manuscript` is empty, show a placeholder

### Layout

- **Navbar**: visible everywhere EXCEPT on landing page (`/`)
- **Footer**: visible everywhere EXCEPT on recipe detail pages (`/recettes/[slug]`)
- **Landing page (`/`)**: hero + citation + recipe grid + souvenirs — no navbar
- **Recipe listing (`/recettes`)**: search + filters + recipe grid — navbar visible
- **Recipe detail (`/recettes/[slug]`)**: full recipe (2-col: manuscript + content) — navbar visible, no footer

## Recipe Data Architecture

### Recipe Frontmatter Schema

```yaml
---
title: 'Recipe Title' # Required — displayed as H1
slug: 'recipe-slug' # Required — URL identifier
manuscript: '' # Path to scanned image (empty = placeholder)
category: 'desserts' # Machine key for filtering
categoryLabel: 'Desserts' # Display label
excerpt: 'Description...' # Short summary for cards
prepTime: '30 min' # Preparation time
cookTime: '40 min' # Cooking time
servings: '8 personnes' # Yield
difficulty: 'Facile' # Facile / Moyen / Difficile
ingredients: # List of ingredient strings
  - '250g de farine'
  - '125g de beurre mou'
notes: "Moumy's personal tips" # Handwritten-style note at bottom
---
```

### Body Format

Numbered steps as plain text (NOT markdown list). mdsvex renders them as paragraphs:

```
1. First step instruction.

2. Second step instruction.

3. Third step instruction.
```

### Adding New Recipes

1. Create `src/lib/data/recipes/slug-du-nom.md`
2. Fill frontmatter (follow schema above)
3. Write numbered steps as body
4. Optionally add manuscript scan to `static/images/manuscripts/` and update `manuscript` field
5. Recipe auto-loads via `import.meta.glob({ eager: true })` — no code changes needed

### Data Loader API (`src/lib/data/recipes.ts`)

| Function                   | Returns                                             |
| -------------------------- | --------------------------------------------------- |
| `getAllRecipes()`          | All recipes sorted by title (French locale)         |
| `getRecipeBySlug(slug)`    | Single recipe or undefined                          |
| `getAllIngredients()`      | All unique ingredients grouped alphabetically       |
| `searchRecipes(query)`     | Recipes matching query in title/excerpt/ingredients |
| `searchIngredients(query)` | Ingredients matching query                          |

### Prerendering

All recipe pages are prerendered (`export const prerender = true` in `+page.ts`).

## Known Issues

- **mdsvex + Svelte 5**: Generates `context="module"` deprecation warnings — suppressed via `onwarn` in `svelte.config.js`
- **Build 404 on `/favicon.ico`**: Prerender fails looking for favicon — either add one or configure `handleHttpError` in `svelte.config.js`

## Key Files

| File                                      | Purpose                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `src/lib/styles/svelteForge.css`          | Skeleton theme configuration                                    |
| `src/lib/styles/tokens.css`               | Design tokens (shadows, spacing, colors)                        |
| `src/lib/styles/fonts.css`                | Fontsource imports (Crimson Pro, Playfair Display, Great Vibes) |
| `src/lib/data/recipes.ts`                 | Recipe data loader (mdsvex + import.meta.glob)                  |
| `src/lib/data/recipes/*.md`               | Recipe content files (8 recipes, → 200+)                        |
| `src/routes/+layout.svelte`               | Root layout (Navbar/Footer conditionals)                        |
| `src/routes/+page.svelte`                 | Homepage                                                        |
| `src/routes/recettes/+page.svelte`        | Recipe listing page                                             |
| `src/routes/recettes/[slug]/+page.svelte` | Individual recipe page                                          |
