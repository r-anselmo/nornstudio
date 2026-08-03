# NornStudio: "O que estamos fazendo" section

## Context

The homepage currently has only the hero (`HeroSection`, with the animated
`LiquidEther` WebGL background). We're adding the next section a visitor
reaches by scrolling past the hero: "O que estamos fazendo" — a manifesto
quote, a skills grid, and a "currently building" card — matching a supplied
mobile reference screenshot. The `LiquidEther` background must not appear
behind this section.

## Goal

Build `WhatWeDoSection` and render it right after `HeroSection` on the
homepage, matching the reference screenshot on mobile, with a proposed
(no reference supplied) responsive treatment for `md`+ screens.

## Decisions

**Placement / why `LiquidEther` doesn't bleed into it**
- `LiquidEther`'s background div is `absolute inset-0` scoped to `HeroSection`'s
  `<main>` (which is `relative` and `min-h-svh`), not to the page. Rendering
  `WhatWeDoSection` as a sibling of `<HeroSection />` in `app/page.tsx` (after
  it in the DOM) is sufficient — no extra hiding logic needed.

**Component**
- Single file `components/what-we-do-section.tsx`, exporting
  `WhatWeDoSection`, matching `hero-section.tsx`'s convention (one file, no
  exported subcomponents). Local `const` arrays for the two repeated lists
  (skills, building tags) mapped into pills, to avoid repeating near-identical
  JSX blocks.
- `bg-carbon-black` on the section root, matching the hero, for visual
  continuity between sections.

**Content (final copy, from the reference)**
- Eyebrow tag: "O que estamos fazendo" — originally a bordered lime pill, later
  switched to the shared `SectionEyebrow` brackets once the other sections
  established that pattern
- Manifesto card: label "manifesto.txt" (top-right, muted, monospace-ish),
  quote-mark icon (`lucide-react` `Quote`), two-line headline "Decidimos o
  caminho." / "Movemos o crescimento." (`font-heading`), body paragraph
  "Growth que nasce da escuta, vira experimento e chega em resultado."
  (`platinum-gray`), footer row "NORNGROWTHDESIGN · SINCE 2026"
- "Habilidades": 2-column grid, 6 pills (icon in a rounded square + label),
  icons from `lucide-react` (already a dependency):
  - UI/UX → `LayoutGrid`
  - Prototyping → `Plug`
  - Growth → `TrendingUp`
  - Systems → `Workflow`
  - Data-Driven-Design → `Database`
  - Research → `UserSearch`
- "Atualmente construindo em" card: heading "CLAUDE CODE & FIGMA", 3 tag
  pills (Claude Code, Figma, Amplitude), small decorative ascending 4-bar
  chart in lime (inline SVG, not a `lucide` icon — needs the exact ascending
  shape from the screenshot)

**Styling**
- No existing "card surface" token in the palette (only `lime`,
  `carbon-black`, `platinum-gray`, `alabaster`). Cards approximate the
  screenshot's raised dark surface with `bg-alabaster/[0.04]` +
  `border border-alabaster/10` (frosted overlay on the dark background)
  rather than inventing an exact hex sampled from a screenshot. Revisit with
  real values if/when a Figma source is available.
- Typography reuses existing tokens: `font-heading` (Cabinet Grotesk) for
  bold headline text, `font-body` (General Sans) for everything else.

**Responsive (no screenshot reference — proposed, not literal)**
- Mobile (default): stacked full-width cards, exactly per the screenshot;
  skills grid stays 2 columns.
- `md`+: content constrained to `max-w-5xl mx-auto`. Manifesto card spans
  full width in a `md:grid-cols-2` grid; Habilidades and "Atualmente
  construindo" cards sit side by side in the two columns below it. Skills
  grid stays 2 columns at every breakpoint (6 items already read well that
  way).

**Testing**
- `components/what-we-do-section.test.tsx`, mirroring `hero-section.test.tsx`:
  render and assert the manifesto text, all 6 skill labels, and all 3
  building tags are present.

## Steps

1. Build `components/what-we-do-section.tsx` (mobile layout first, matching
   the screenshot exactly)
2. Add the `md:` responsive grid treatment
3. Write `components/what-we-do-section.test.tsx`
4. Render `<WhatWeDoSection />` after `<HeroSection />` in `app/page.tsx`
5. Run lint, typecheck, and the test suite
6. Visual check in the browser (mobile viewport + a wider one) before
   calling it done

## Out of scope

- No new design tokens added to `app/globals.css` beyond what's already
  there — card surfaces use opacity-based overlays instead
- No CMS/content wiring — copy is hardcoded to match the reference
- No further homepage sections beyond this one
- No pixel-perfect desktop reference — the `md:`/`lg:` treatment is a
  reasonable proposal, not a match to a supplied design
