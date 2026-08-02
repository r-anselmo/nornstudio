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
- Colors: near-black background (`#141414`), lime accent `#C6F432` (matches
  the `LiquidEther` `colors` prop), white headline text, muted gray subtext
- Typography: temporary heavy grotesk from `next/font/google` (Archivo Black
  or Inter, weight 900) behind a single `--font-heading` token/CSS variable,
  so the real Norn brand font (to be supplied later as files) can replace it
  in one place
- Logo: placeholder lime rounded-square "N" mark built in CSS/text, swappable
  for a real logo asset later
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
5. Add heading font via `next/font/google`, exposed as a `--font-heading` CSS
   variable
6. Build `components/live-clock.tsx`
7. Build `components/hero-section.tsx` (top bar, headline, subtext, CTAs,
   bottom info row, `LiquidEther` background)
8. Render `HeroSection` from `app/page.tsx`, replacing the default scaffold
   content
9. Commit

## Out of scope

- No additional pages, routes, or sections beyond the hero
- No deployment configuration
- No additional shadcn components beyond `LiquidEther`
- No real logo asset or final brand font file (both are placeholders until
  supplied)
- No CMS/content wiring — copy is hardcoded to match the reference
