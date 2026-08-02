# Norn Landing Page Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the NornStudio Next.js project and build a responsive, mobile-first hero section matching the supplied reference design, using the Norn brand book (Cabinet Grotesk, General Sans, brand colors) and the `LiquidEther` shadcn component as an animated background.

**Architecture:** A single Next.js App Router project. Two small, independently testable units carry the real logic — a pure `formatClockTime` function and the `LiveClock` client component that uses it — composed into a presentational `HeroSection` component that also renders the `LiquidEther` background. `HeroSection` is rendered from `app/page.tsx`. Brand fonts are self-hosted via `next/font/local`; brand colors are Tailwind v4 theme tokens.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS v4, shadcn CLI, `@react-bits/LiquidEther-JS-CSS`, `next/font/local` (Cabinet Grotesk, General Sans — files already supplied locally), Vitest + React Testing Library.

---

## Reference material

- Spec: `docs/superpowers/specs/2026-08-02-liquidether-setup-design.md`
- Cabinet Grotesk fonts: `/Users/rodrigoanselmodasilva/Downloads/cabinet-grotesk/`
- General Sans fonts: `/Users/rodrigoanselmodasilva/Downloads/GeneralSans_Complete/Fonts/WEB/fonts/`
- Brand colors: Lime `#C6F432`, Carbon Black `#1D1E18`, Platinum Gray `#C7C7C5`, Alabaster White `#FAFBFA`

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: entire `create-next-app` output (`app/`, `package.json`, `tsconfig.json`, `app/globals.css`, etc.)

- [ ] **Step 1: Run create-next-app non-interactively**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --turbopack \
  --yes
```

Expected: exits 0, creates `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tsconfig.json`. The pre-existing `docs/` folder and `.git/` are untouched (create-next-app allow-lists `docs` and `.git` when checking that the target directory is safe to scaffold into).

- [ ] **Step 2: Verify the app boots**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript, Tailwind, App Router"
```

---

### Task 2: Install shadcn/ui and the LiquidEther component

**Files:**
- Create: `components.json`, `app/globals.css` (shadcn theme block), `lib/utils.ts`, the installed LiquidEther component file (exact path confirmed in Step 3 below)

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -d -y
```

Expected: exits 0, creates `components.json` and adds a `:root { --background: ...; ... }` + `@theme inline { --color-background: var(--background); ... }` block to `app/globals.css`.

- [ ] **Step 2: Add the LiquidEther component**

```bash
npx shadcn@latest add @react-bits/LiquidEther-JS-CSS -y
```

Expected: exits 0, prints the path of the file(s) it created/modified and installs any peer dependencies (e.g. WebGL/animation libs) into `package.json`.

- [ ] **Step 3: Confirm the installed file path and export name**

```bash
find . -iname "*liquid-ether*" -not -path "./node_modules/*"
```

Note the printed path. This plan assumes it is `components/ui/liquid-ether.tsx`, exporting a component named `LiquidEther` (matching the JSX usage `<LiquidEther mouseForce={20} ... />` from the reference snippet). Confirm with:

```bash
grep -n "export" components/ui/liquid-ether.tsx
```

If the CLI used a different path or export name, use that actual path/name in Tasks 8 and 9 instead of `@/components/ui/liquid-ether`.

- [ ] **Step 4: Verify the build still succeeds**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: install shadcn and the LiquidEther background component"
```

---

### Task 3: Add Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `lib/sanity.test.ts` (temporary)
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Create the Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Add the `test` script**

Modify `package.json` — add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 4: Write a sanity test to prove the setup works**

`lib/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run it and verify it passes**

```bash
npm test
```

Expected: `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Vitest and React Testing Library"
```

---

### Task 4: Self-host the Norn brand fonts

**Files:**
- Create: `app/fonts/cabinet-grotesk/CabinetGrotesk-Black.otf`, `app/fonts/general-sans/GeneralSans-Regular.woff2`, `app/fonts/general-sans/GeneralSans-Medium.woff2`, `app/fonts.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Copy the font files into the project**

```bash
mkdir -p app/fonts/cabinet-grotesk app/fonts/general-sans
cp "/Users/rodrigoanselmodasilva/Downloads/cabinet-grotesk/CabinetGrotesk-Black.otf" app/fonts/cabinet-grotesk/
cp "/Users/rodrigoanselmodasilva/Downloads/GeneralSans_Complete/Fonts/WEB/fonts/GeneralSans-Regular.woff2" app/fonts/general-sans/
cp "/Users/rodrigoanselmodasilva/Downloads/GeneralSans_Complete/Fonts/WEB/fonts/GeneralSans-Medium.woff2" app/fonts/general-sans/
```

- [ ] **Step 2: Configure `next/font/local`**

`app/fonts.ts`:
```ts
import localFont from 'next/font/local'

export const cabinetGrotesk = localFont({
  src: [
    {
      path: './fonts/cabinet-grotesk/CabinetGrotesk-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
})

export const generalSans = localFont({
  src: [
    {
      path: './fonts/general-sans/GeneralSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/general-sans/GeneralSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
})
```

- [ ] **Step 3: Apply the fonts in the root layout**

Replace the full contents of `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Norn — Growth Design',
  description:
    'Do experimento ao resultado: a gente acelera suas iniciativas digitais por dentro.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cabinetGrotesk.variable} ${generalSans.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify the build succeeds**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: self-host Cabinet Grotesk and General Sans brand fonts"
```

---

### Task 5: Add the Norn brand color tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add brand tokens to the shadcn theme block**

Open `app/globals.css`. Find the `@theme inline { ... }` block that `shadcn init` generated in Task 2 (it contains lines like `--color-background: var(--background);`). Add these lines inside that block, before its closing `}`:

```css
  --color-lime: #c6f432;
  --color-carbon-black: #1d1e18;
  --color-platinum-gray: #c7c7c5;
  --color-alabaster: #fafbfa;
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
```

This makes `bg-lime`, `text-lime`, `border-lime`, `bg-carbon-black`, `text-carbon-black`, `text-platinum-gray`, `bg-alabaster`, `text-alabaster`, `font-heading`, and `font-body` available as Tailwind utility classes.

- [ ] **Step 2: Verify the tokens compile into CSS**

```bash
npm run build
grep -ril "c6f432" .next/static/css/
```

Expected: at least one `.css` file path is printed.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Norn brand color tokens to the Tailwind theme"
```

---

### Task 6: `formatClockTime` pure function (TDD)

**Files:**
- Create: `lib/format-time.ts`, `lib/format-time.test.ts`
- Delete: `lib/sanity.test.ts` (no longer needed now that a real test exists)

- [ ] **Step 1: Write the failing test**

`lib/format-time.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatClockTime } from './format-time'

describe('formatClockTime', () => {
  it('pads single-digit hours, minutes, and seconds with zeros', () => {
    expect(formatClockTime(new Date(2026, 0, 1, 9, 5, 3))).toBe('09:05:03')
  })

  it('formats double-digit values without extra padding', () => {
    expect(formatClockTime(new Date(2026, 0, 1, 17, 2, 13))).toBe('17:02:13')
  })
})
```

- [ ] **Step 2: Run it and verify it fails**

```bash
npm test -- lib/format-time.test.ts
```

Expected: FAIL — `Cannot find module './format-time'` (or similar).

- [ ] **Step 3: Implement the function**

`lib/format-time.ts`:
```ts
export function formatClockTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
```

- [ ] **Step 4: Run it and verify it passes**

```bash
npm test -- lib/format-time.test.ts
```

Expected: `2 passed`.

- [ ] **Step 5: Remove the now-redundant sanity test**

```bash
rm lib/sanity.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add formatClockTime with tests"
```

---

### Task 7: `LiveClock` component (TDD)

**Files:**
- Create: `components/live-clock.tsx`, `components/live-clock.test.tsx`

- [ ] **Step 1: Write the failing test**

`components/live-clock.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveClock } from './live-clock'

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 17, 2, 13))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current time after mounting', () => {
    render(<LiveClock />)
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByText('LIVE · 17:02:13')).toBeInTheDocument()
  })

  it('updates the displayed time every second', () => {
    render(<LiveClock />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('LIVE · 17:02:14')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it and verify it fails**

```bash
npm test -- components/live-clock.test.tsx
```

Expected: FAIL — `Cannot find module './live-clock'` (or similar).

- [ ] **Step 3: Implement the component**

`components/live-clock.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { formatClockTime } from '@/lib/format-time'

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(formatClockTime(new Date()))
    const id = setInterval(() => {
      setTime(formatClockTime(new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (time === null) {
    return null
  }

  return (
    <div className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.02em] text-alabaster">
      <span className="h-2 w-2 rounded-full bg-lime" />
      <span>LIVE · {time}</span>
    </div>
  )
}
```

- [ ] **Step 4: Run it and verify it passes**

```bash
npm test -- components/live-clock.test.tsx
```

Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add LiveClock component with tests"
```

---

### Task 8: `HeroSection` component (TDD)

**Files:**
- Create: `components/hero-section.tsx`, `components/hero-section.test.tsx`

> Uses `LiquidEther` from `@/components/ui/liquid-ether` (adjust the import if Task 2 Step 3 found a different path/export name).

- [ ] **Step 1: Write the failing test**

`components/hero-section.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './hero-section'

vi.mock('@/components/ui/liquid-ether', () => ({
  LiquidEther: () => null,
}))

describe('HeroSection', () => {
  it('renders the headline, subtext, and both CTAs', () => {
    render(<HeroSection />)

    expect(screen.getByText('TODO MUNDO')).toBeInTheDocument()
    expect(screen.getByText('FALA EM')).toBeInTheDocument()
    expect(screen.getByText('ESTRATÉGIA.')).toBeInTheDocument()
    expect(screen.getByText('A GENTE')).toBeInTheDocument()
    expect(screen.getByText('EXECUTA.')).toBeInTheDocument()
    expect(
      screen.getByText(/Do experimento ao resultado/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Iniciar Projeto/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver serviços' })
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it and verify it fails**

```bash
npm test -- components/hero-section.test.tsx
```

Expected: FAIL — `Cannot find module './hero-section'` (or similar).

- [ ] **Step 3: Implement the component**

`components/hero-section.tsx`:
```tsx
import { LiquidEther } from '@/components/ui/liquid-ether'
import { LiveClock } from '@/components/live-clock'

export function HeroSection() {
  return (
    <section className="relative flex min-h-svh w-full flex-col overflow-hidden bg-carbon-black px-6 py-6 md:px-12 md:py-10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          colors={['#C6F432', '#C6F432', '#C6F432']}
          autoDemo={false}
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.5}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime">
            <span className="font-heading text-lg font-black text-carbon-black">
              N
            </span>
          </div>
          <div className="h-px flex-1 bg-alabaster/30" />
          <LiveClock />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-[0.02em] text-alabaster md:text-6xl lg:text-7xl">
            <span className="block">TODO MUNDO</span>
            <span className="block">FALA EM</span>
            <span className="block">ESTRATÉGIA.</span>
            <span className="mt-2 block rounded-xl bg-lime px-4 py-1 text-carbon-black">
              A GENTE
            </span>
            <span className="mt-2 block rounded-xl bg-lime px-4 py-1 text-carbon-black">
              EXECUTA.
            </span>
          </h1>

          <p className="max-w-sm font-body text-base text-platinum-gray md:text-lg">
            Do experimento ao resultado: a gente acelera suas iniciativas
            digitais por dentro.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contato"
              className="flex items-center gap-2 rounded-full border border-lime px-6 py-3 font-body text-sm font-medium text-lime"
            >
              Iniciar Projeto
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#servicos"
              className="font-body text-sm font-medium text-lime"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <footer className="flex items-end justify-between font-body text-xs font-medium tracking-[0.02em] text-alabaster">
          <div>
            <p>ATUANDO GLOBALMENTE</p>
            <p className="text-platinum-gray">SEM ESCRITÓRIO, POR OPÇÃO</p>
          </div>
          <div className="text-right">
            <p>AGENDA ABERTA, 2026</p>
            <p className="text-platinum-gray">NO SEU FUSO-HORÁRIO</p>
          </div>
        </footer>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run it and verify it passes**

```bash
npm test -- components/hero-section.test.tsx
```

Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add HeroSection component with tests"
```

---

### Task 9: Wire the hero into the homepage and verify visually

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Render `HeroSection` from the homepage**

Replace the full contents of `app/page.tsx`:
```tsx
import { HeroSection } from '@/components/hero-section'

export default function Home() {
  return <HeroSection />
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Run the build and linter**

```bash
npm run build
npm run lint
```

Expected: both succeed with no errors.

- [ ] **Step 4: Manually verify in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Compare against the reference screenshot at a mobile viewport (~390px wide) first — check the headline chips, live clock ticking, CTA styling, and bottom info row — then check `md`/`lg` breakpoints to confirm the composition scales up cleanly. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: render the hero section on the homepage"
```

---

## Self-review notes

- Spec coverage: scaffold (Task 1), shadcn + LiquidEther install (Task 2), test tooling (Task 3), fonts (Task 4), colors (Task 5), live clock (Tasks 6–7), hero composition + LiquidEther full-bleed background (Task 8), homepage wiring + responsive/visual check (Task 9). All spec decisions are covered.
- The one open variable is the exact file path/export name the `shadcn add` command produces for LiquidEther — flagged explicitly in Task 2 Step 3 and Task 8's header note, with a concrete default assumption (`@/components/ui/liquid-ether`, export `LiquidEther`) to adjust only if the CLI output differs.
