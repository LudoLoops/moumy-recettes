# AGENTS.md — Les recettes de Moumy

> Recipe tribute website for a grandmother — handwritten family recipes, archived forever.

## Quick Reference

| Category | Convention |
|----------|------------|
| Package Manager | `bun` |
| Framework | SvelteKit + Svelte 5 (runes mode) |
| UI Library | Skeleton UI v4 (`@skeletonlabs/skeleton`) |
| CSS | Tailwind v4 + Skeleton theme tokens |
| Markdown | mdsvex (`.md` recipe files) |
| Fonts | Crimson Pro (body), Playfair Display (headings), Great Vibes (handwriting) |
| Content Language | French (recipes) / English (UI code comments) |

## Commands

```bash
bun dev              # Start dev server (with --host)
bun build            # Production build
bun check            # TypeScript type check
bun lint             # ESLint + Prettier check
bun format           # Format code
bun test:unit        # Run Vitest tests
bun db:push          # Push Drizzle schema to DB
bun db:studio        # Drizzle Studio GUI
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
│   ├── recette/[slug]/              ← Individual recipe pages
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

### Theme Tokens

Use Skeleton semantic tokens, NOT raw Tailwind colors:

| Token | Usage |
|-------|-------|
| `surface` | Backgrounds, cards |
| `primary` | Primary actions, links |
| `secondary` | Secondary elements |
| `tertiary` | Subtle backgrounds |
| `success` | Positive states |
| `warning` | Caution states |
| `error` | Error states |

```html
<!-- ✅ CORRECT -->
<div class="bg-surface-100-900">

<!-- ❌ WRONG -->
<div class="bg-gray-100 dark:bg-gray-900">
```

### Exception: Cards

`bg-white` IS allowed on Card components (matches reference design).

### Svelte 5 Conventions

- Use `{@render children()}` — NOT `<slot />`
- Use `onclick` — NOT `on:click`
- Use runes: `$state`, `$derived`, `$effect`, `$props()`
- Module context (`<script context="module">`) is deprecated in Svelte 5 — mdsvex generates warnings, these are cosmetic only

### Design Tokens (CSS Custom Properties)

Components use `var(--token)` via inline `style`. Color pairings stay as Tailwind classes.

Key tokens in `tokens.css`:

- `--shadow-card` / `--shadow-deep` / `--shadow-hover` / `--shadow-focus` — multi-layer shadows
- `--section-spacing` / `--section-spacing-lg` — 80px / 120px
- `--color-cream`, `--color-warm-brown`, `--color-gold`, `--color-gold-light` — Moumy palette
- `--font-serif`, `--font-serif-heading`, `--font-handwriting` — font families

## Moumy-Specific Design Rules

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#FAF7F2` | Page background, warm base |
| Warm Brown | `#8B6F5C` | Primary text, headings |
| Gold | `#C9A962` | Accents, badges, highlights |
| Gold Light | gradient endpoint | Badge gradient |

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

- **No Navbar** on public recipe pages (homepage, `/recette/*`) — hidden via conditional in `+layout.svelte`
- **Footer** hidden on `/recette/*` — visible on `/` and `/ingredients`

## Recipe Data Architecture

### Recipe Frontmatter Schema

```yaml
---
title: "Recipe Title"           # Required — displayed as H1
slug: "recipe-slug"             # Required — URL identifier
manuscript: ""                  # Path to scanned image (empty = placeholder)
category: "desserts"            # Machine key for filtering
categoryLabel: "Desserts"       # Display label
excerpt: "Description..."       # Short summary for cards
prepTime: "30 min"              # Preparation time
cookTime: "40 min"              # Cooking time
servings: "8 personnes"         # Yield
difficulty: "Facile"            # Facile / Moyen / Difficile
ingredients:                    # List of ingredient strings
  - "250g de farine"
  - "125g de beurre mou"
notes: "Moumy's personal tips"  # Handwritten-style note at bottom
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

| Function | Returns |
|----------|---------|
| `getAllRecipes()` | All recipes sorted by title (French locale) |
| `getRecipeBySlug(slug)` | Single recipe or undefined |
| `getAllIngredients()` | All unique ingredients grouped alphabetically |
| `searchRecipes(query)` | Recipes matching query in title/excerpt/ingredients |
| `searchIngredients(query)` | Ingredients matching query |

### Prerendering

All recipe pages are prerendered (`export const prerender = true` in `+page.ts`).

## Known Issues

- **mdsvex + Svelte 5**: Generates `context="module"` deprecation warnings — cosmetic only, not errors
- **Build 404 on `/favicon.ico`**: Prerender fails looking for favicon — either add one or configure `handleHttpError` in `svelte.config.js`
- **Navbar conditionals**: Currently hidden via `{#if}` in layout — user wants it removed entirely from public pages

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/styles/svelteForge.css` | Skeleton theme configuration |
| `src/lib/styles/tokens.css` | Design tokens (shadows, spacing, colors) |
| `src/lib/styles/fonts.css` | Fontsource imports (Crimson Pro, Playfair Display, Great Vibes) |
| `src/lib/data/recipes.ts` | Recipe data loader (mdsvex + import.meta.glob) |
| `src/lib/data/recipes/*.md` | Recipe content files (8 recipes, → 200+) |
| `src/routes/+layout.svelte` | Root layout (Navbar/Footer conditionals) |
| `src/routes/+page.svelte` | Homepage |
| `src/routes/recette/[slug]/+page.svelte` | Individual recipe page |
