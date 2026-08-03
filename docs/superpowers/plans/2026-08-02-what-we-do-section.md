# "O que estamos fazendo" Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the "O que estamos fazendo" section (manifesto card, skills grid, "currently building" card) to the homepage, rendered right after the hero, matching the supplied mobile screenshot and with a proposed `md:`+ layout.

**Architecture:** One new presentational component, `WhatWeDoSection`, in its own file (mirrors the existing `HeroSection` file convention: single file, no exported subcomponents, local data arrays for the repeated skill/tag lists). It's rendered as a sibling of `<HeroSection />` in `app/page.tsx` — the `LiquidEther` background is `absolute inset-0` scoped to `HeroSection`'s own `<main>`, so a sibling section is naturally never covered by it, no extra logic needed.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, `lucide-react` (icons, already a dependency), Vitest + Testing Library (existing test stack).

---

## Reference

Full spec: `docs/superpowers/specs/2026-08-02-what-we-do-section-design.md`

Existing conventions this plan follows:
- `components/hero-section.tsx` — single-file section component, brand color tokens (`lime`, `carbon-black`, `platinum-gray`, `alabaster`), `font-heading`/`font-body` tokens, multi-line headline text as separate `<span className="block">` elements (both for layout and so each line is independently queryable in tests)
- `components/hero-section.test.tsx` — render + `screen.getByText` assertions; regex partial-match for any paragraph text that's wrapped across multiple source lines (JSX collapses that whitespace, but partial-match sidesteps relying on the exact collapsed string)

### Task 1: Write the failing test for `WhatWeDoSection`

**Files:**
- Create: `components/what-we-do-section.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatWeDoSection } from './what-we-do-section'

describe('WhatWeDoSection', () => {
  it('renders the eyebrow tag', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('O que estamos fazendo')).toBeInTheDocument()
  })

  it('renders the manifesto card', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('manifesto.txt')).toBeInTheDocument()
    expect(screen.getByText('Decidimos o caminho.')).toBeInTheDocument()
    expect(screen.getByText('Movemos o crescimento.')).toBeInTheDocument()
    expect(
      screen.getByText(/Growth que nasce da escuta/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText('NORNGROWTHDESIGN · SINCE 2026')
    ).toBeInTheDocument()
  })

  it('renders all six skills', () => {
    render(<WhatWeDoSection />)

    const skills = [
      'UI/UX',
      'Prototyping',
      'Growth',
      'Systems',
      'Data-Driven-Design',
      'Research',
    ]
    for (const skill of skills) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })

  it('renders the currently-building card', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('CLAUDE CODE & FIGMA')).toBeInTheDocument()
    for (const tag of ['Claude Code', 'Figma', 'Amplitude']) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/what-we-do-section.test.tsx`
Expected: FAIL — `Failed to resolve import "./what-we-do-section"` (the component doesn't exist yet)

---

### Task 2: Implement `WhatWeDoSection` (mobile layout, matches the screenshot)

**Files:**
- Create: `components/what-we-do-section.tsx`

- [ ] **Step 1: Write the component**

```tsx
import {
  Database,
  LayoutGrid,
  Plug,
  Quote,
  TrendingUp,
  UserSearch,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Skill = {
  label: string
  icon: LucideIcon
}

const skills: Skill[] = [
  { label: 'UI/UX', icon: LayoutGrid },
  { label: 'Prototyping', icon: Plug },
  { label: 'Growth', icon: TrendingUp },
  { label: 'Systems', icon: Workflow },
  { label: 'Data-Driven-Design', icon: Database },
  { label: 'Research', icon: UserSearch },
]

const buildingTags = ['Claude Code', 'Figma', 'Amplitude']

export function WhatWeDoSection() {
  return (
    <section className="bg-carbon-black px-6 py-16">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center rounded-md border border-lime/40 px-3 py-1 font-body text-xs font-medium tracking-[0.02em] text-lime">
          O que estamos fazendo
        </span>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6">
            <div className="flex items-start justify-between">
              <Quote className="h-6 w-6 text-lime" aria-hidden="true" />
              <span className="font-body text-xs text-platinum-gray">
                manifesto.txt
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black leading-tight text-alabaster">
              <span className="block">Decidimos o caminho.</span>
              <span className="block">Movemos o crescimento.</span>
            </h2>
            <p className="font-body text-base text-platinum-gray">
              Growth que nasce da escuta, vira experimento e chega em
              resultado.
            </p>
            <p className="font-body text-xs font-medium tracking-[0.02em] text-platinum-gray">
              NORNGROWTHDESIGN · SINCE 2026
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Habilidades
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {skills.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-alabaster/10 px-3 py-3"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-alabaster"
                    aria-hidden="true"
                  />
                  <span className="font-body text-sm text-alabaster">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Atualmente construindo em
              </span>
            </div>
            <h3 className="font-heading text-lg font-black text-alabaster">
              CLAUDE CODE &amp; FIGMA
            </h3>
            <div className="flex flex-wrap gap-2">
              {buildingTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-alabaster/10 px-3 py-1 font-body text-sm text-alabaster"
                >
                  {tag}
                </span>
              ))}
            </div>
            <svg
              viewBox="0 0 32 16"
              className="h-4 w-8 text-lime"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="0" y="10" width="5" height="6" rx="1" />
              <rect x="9" y="6" width="5" height="10" rx="1" />
              <rect x="18" y="3" width="5" height="13" rx="1" />
              <rect x="27" y="0" width="5" height="16" rx="1" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `npx vitest run components/what-we-do-section.test.tsx`
Expected: PASS — 4 tests passing

- [ ] **Step 3: Lint and typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: no errors (the 3 pre-existing `LiquidEther.jsx` warnings are unrelated and fine)

- [ ] **Step 4: Commit**

```bash
git add components/what-we-do-section.tsx components/what-we-do-section.test.tsx
git commit -m "feat: add WhatWeDoSection component"
```

---

### Task 3: Add the `md:`+ responsive layout

No screenshot reference exists for desktop — this is the proposed treatment from the spec: content constrained to `max-w-5xl`, the manifesto card spans both columns of a two-column grid, and the skills/building cards sit side by side below it. This is a pure CSS change; no new test is needed since text content and structure don't change, only layout classes.

**Files:**
- Modify: `components/what-we-do-section.tsx`

- [ ] **Step 1: Update the section, wrapper, and grid classes**

Replace the full contents of `components/what-we-do-section.tsx` with:

```tsx
import {
  Database,
  LayoutGrid,
  Plug,
  Quote,
  TrendingUp,
  UserSearch,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Skill = {
  label: string
  icon: LucideIcon
}

const skills: Skill[] = [
  { label: 'UI/UX', icon: LayoutGrid },
  { label: 'Prototyping', icon: Plug },
  { label: 'Growth', icon: TrendingUp },
  { label: 'Systems', icon: Workflow },
  { label: 'Data-Driven-Design', icon: Database },
  { label: 'Research', icon: UserSearch },
]

const buildingTags = ['Claude Code', 'Figma', 'Amplitude']

export function WhatWeDoSection() {
  return (
    <section className="bg-carbon-black px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <span className="inline-flex w-fit items-center rounded-md border border-lime/40 px-3 py-1 font-body text-xs font-medium tracking-[0.02em] text-lime">
          O que estamos fazendo
        </span>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 md:col-span-2">
            <div className="flex items-start justify-between">
              <Quote className="h-6 w-6 text-lime" aria-hidden="true" />
              <span className="font-body text-xs text-platinum-gray">
                manifesto.txt
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black leading-tight text-alabaster">
              <span className="block">Decidimos o caminho.</span>
              <span className="block">Movemos o crescimento.</span>
            </h2>
            <p className="font-body text-base text-platinum-gray">
              Growth que nasce da escuta, vira experimento e chega em
              resultado.
            </p>
            <p className="font-body text-xs font-medium tracking-[0.02em] text-platinum-gray">
              NORNGROWTHDESIGN · SINCE 2026
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Habilidades
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {skills.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-alabaster/10 px-3 py-3"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-alabaster"
                    aria-hidden="true"
                  />
                  <span className="font-body text-sm text-alabaster">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Atualmente construindo em
              </span>
            </div>
            <h3 className="font-heading text-lg font-black text-alabaster">
              CLAUDE CODE &amp; FIGMA
            </h3>
            <div className="flex flex-wrap gap-2">
              {buildingTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-alabaster/10 px-3 py-1 font-body text-sm text-alabaster"
                >
                  {tag}
                </span>
              ))}
            </div>
            <svg
              viewBox="0 0 32 16"
              className="h-4 w-8 text-lime"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="0" y="10" width="5" height="6" rx="1" />
              <rect x="9" y="6" width="5" height="10" rx="1" />
              <rect x="18" y="3" width="5" height="13" rx="1" />
              <rect x="27" y="0" width="5" height="16" rx="1" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run the test suite to confirm nothing broke**

Run: `npx vitest run components/what-we-do-section.test.tsx`
Expected: PASS — same 4 tests, unaffected by the class changes

- [ ] **Step 3: Commit**

```bash
git add components/what-we-do-section.tsx
git commit -m "feat: add md+ responsive layout to WhatWeDoSection"
```

---

### Task 4: Render `WhatWeDoSection` on the homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

Replace its contents with:

```tsx
import { HeroSection } from '@/components/hero-section'
import { WhatWeDoSection } from '@/components/what-we-do-section'

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
    </>
  )
}
```

- [ ] **Step 2: Run the full test suite, lint, and typecheck**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: all pass (17 tests: the existing 13 plus the 4 new `WhatWeDoSection` tests)

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: render WhatWeDoSection on the homepage"
```

---

### Task 5: Manual verification in the browser

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (or reuse an already-running instance) and open `http://localhost:3000` (or whatever port it reports)

- [ ] **Step 2: Check mobile width**

Using the browser's device toolbar (or an actual phone on the same network), confirm at a ~390px-wide viewport that:
- Scrolling past the hero reveals "O que estamos fazendo" with no `LiquidEther` background visible behind it (solid `carbon-black`)
- The manifesto card, skills grid (2 columns, 6 items), and "currently building" card match the reference screenshot's layout and copy

- [ ] **Step 3: Check a wider viewport**

At `md`+ width (≥768px), confirm the manifesto card spans the full row and the skills/building cards sit side by side below it, inside a centered, width-constrained container.

- [ ] **Step 4: Push**

```bash
git push
```

This also re-triggers the GitHub Pages deploy workflow (`.github/workflows/deploy-pages.yml`), so `https://r-anselmo.github.io/nornstudio/` picks up the new section automatically.

## Self-review notes

- **Spec coverage:** placement/no-LiquidEther-bleed (Task 4's structure), component + content (Task 2), styling approximation for card surfaces (`bg-alabaster/5`/`10` in Task 2), responsive `md:` treatment (Task 3), tests (Task 1) — all covered.
- **Type consistency:** `Skill` type and `skills`/`buildingTags` arrays are identical between Task 2 and Task 3 (Task 3 is a full-file replace, not a partial diff, to avoid drift).
- **No placeholders:** every step has literal, complete code and exact commands.
