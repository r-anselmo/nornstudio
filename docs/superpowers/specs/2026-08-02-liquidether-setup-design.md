# NornStudio: Next.js scaffold + landing page hero (LiquidEther background)

## Context

`NornStudio` is the landing page for Norn, a growth-design agency. The
directory started empty and needs a Next.js project scaffolded with shadcn
configured, then a real hero section built to match a supplied mobile
reference design, using `@react-bits/LiquidEther-JS-CSS` as an animated
background effect.

## Goal

Stand up the Next.js project, install the `LiquidEther` component via the
`shadcn` CLI, and build the hero section (mobile-first, responsive) matching
the reference screenshot: dark background, lime accent, bold headline with
highlighted lines, live local-time indicator, CTAs, and a bottom info row.

## Decisions

**Scaffold**
- Package manager: npm
- Language: TypeScript
- Router: App Router
- Styling: Tailwind CSS (required by shadcn)
- Version control: git, already initialized; commit scaffold once created

**Hero section**
- Mobile-first layout (per reference image), scaling up at `md`/`lg` as the
  same centered vertical composition, just larger — no separate desktop
  redesign
- Colors, from the Norn brand book: Lime `#C6F432` (accent, matches the
  `LiquidEther` `colors` prop), Carbon Black `#1D1E18` (hero background),
  Platinum Gray `#C7C7C5` (muted subtext), Alabaster White `#FAFBFA`
  (headline/primary text) — wired as Tailwind theme tokens
  (`lime`/`carbon-black`/`platinum-gray`/`alabaster`), not raw hex in markup
- Typography, from the brand book, both self-hosted via `next/font/local`
  (files already supplied locally):
  - Primary/headings: **Cabinet Grotesk** — Black for the headline lines,
    Medium for the subheadline-weight text — `.otf` files at
    `~/Downloads/cabinet-grotesk/`, copied into `app/fonts/cabinet-grotesk/`.
    Exposed as CSS var `--font-heading`
  - Secondary/body & UI: **General Sans** — Regular for body copy, Medium
    for UI labels/buttons (tracking 2%, per brand book) — `.woff2` files at
    `~/Downloads/GeneralSans_Complete/Fonts/WEB/fonts/`, copied into
    `app/fonts/general-sans/`. Exposed as CSS var `--font-body`
  - Sizing follows the brand book type hierarchy (mobile-first: start below
    the desktop Headline 1/2 spec of 56/60pt and 40/48pt, tracking 2%, and
    scale up at `md`/`lg`; subtext at Body Regular 16pt/24; CTAs/labels at
    UI Label 14pt/20, tracking 2%)
- Logo: brand book shows a dedicated "N" mark (icon-only variant, min size
  110×48px) but no vector file was supplied — still a placeholder rounded
  lime square approximating the mark's shape/colors, swappable for the real
  SVG once provided
- Live clock: client component (`components/live-clock.tsx`), updates every
  second via `useEffect`/`setInterval`, renders the visitor's local time,
  renders nothing until mounted to avoid SSR/CSR hydration mismatch
- Headline: "TODO MUNDO FALA EM ESTRATÉGIA." in plain white text, followed by
  "A GENTE" and "EXECUTA." each rendered as its own lime rounded-chip line
  (`bg-[#C6F432] text-black rounded-xl`)
- CTAs: "Iniciar Projeto →" as an outlined lime pill button, "Ver serviços"
  as a plain lime text link
- Bottom info row: two small bold uppercase text columns
  ("ATUANDO GLOBALMENTE / SEM ESCRITÓRIO, POR OPÇÃO" and
  "AGENDA ABERTA, 2026 / NO SEU FUSO-HORÁRIO"), spaced with `justify-between`,
  pinned to the bottom of the hero
- `LiquidEther` background: swapped from the supplied fixed `1080x1080px`
  snippet to `absolute inset-0 w-full h-full` inside a
  `relative overflow-hidden` hero container, so it fills the section at any
  viewport size; page content sits in a `relative z-10` wrapper on top;
  props (`mouseForce`, `cursorSize`, `isViscous`, `viscous`, `colors`,
  `autoDemo`, `autoSpeed`, `autoIntensity`, `isBounce`, `resolution`) kept
  exactly as supplied

## Steps

1. `git init` (done)
2. `npx create-next-app@latest .` with TypeScript, App Router, Tailwind CSS,
   ESLint, npm, default `@/*` import alias
3. `npx shadcn@latest init` to generate `components.json` and theme tokens
4. `npx shadcn@latest add @react-bits/LiquidEther-JS-CSS`
5. Copy the supplied font files into `app/fonts/cabinet-grotesk/` (`.otf`)
   and `app/fonts/general-sans/` (`.woff2`); configure both via
   `next/font/local` in `app/fonts.ts`, exposing `--font-heading` and
   `--font-body` CSS variables applied on `<html>`/`<body>`
6. Add the brand palette (Lime, Carbon Black, Platinum Gray, Alabaster) as
   Tailwind theme tokens
7. Build `components/live-clock.tsx`
8. Build `components/hero-section.tsx` (top bar, headline, subtext, CTAs,
   bottom info row, `LiquidEther` background)
9. Render `HeroSection` from `app/page.tsx`, replacing the default scaffold
   content
10. Commit

## Out of scope

- No additional pages, routes, or sections beyond the hero
- No deployment configuration
- No additional shadcn components beyond `LiquidEther`
- No real logo SVG (brand book shows it, but no vector file was supplied) —
  placeholder mark stays until provided
- No CMS/content wiring — copy is hardcoded to match the reference
