# Contact Dialog and Motion Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the "Iniciar Projeto" buttons a working contact form that mails
`rodrigogrowthdesign@gmail.com`, and bring the whole site up to the motion and
accessibility standard the chat section already sets.

**Architecture:** A blocking `<head>` script adds a `js-motion` class to
`<html>` before first paint; every hidden-initial state keys off that class in
CSS rather than off React state, which is what makes reveals flash-free and
keeps the server HTML fully visible for no-JS and reduced-motion visitors. The
contact form is one dialog instance mounted behind a context in `layout.tsx`,
opened by lightweight triggers, submitting through a single isolated
`submitContact` function.

**Tech Stack:** Next.js 16 (static export), React 19, Tailwind CSS 4.3.3,
`@base-ui/react` 1.6.0 Dialog, Vitest + Testing Library, Web3Forms.

---

## Verified facts this plan depends on

These were checked against the installed packages, not assumed:

- `@theme { --ease-*: … }` generates `ease-*` utilities. **`--duration-*` does
  not generate `duration-*` utilities** — the variable is emitted but no class
  is. Durations must therefore use `@utility`.
- `@theme { --animate-foo: … }` generates `animate-foo`.
- `@base-ui/react/dialog` exports `Dialog.Root`, `.Portal`, `.Backdrop`,
  `.Popup`, `.Title`, `.Description`, `.Close`.
- Base UI sets `data-starting-style` / `data-ending-style` during transitions,
  and `data-[starting-style]:` / `data-[ending-style]:` are valid Tailwind
  variants.

## File structure

**Create:**
- `lib/motion.ts` — the motion gate class name and shared reveal constants.
- `components/ui/reveal.tsx` — scroll-entrance primitive.
- `lib/contact.ts` — contact copy and Web3Forms constants.
- `lib/validate-contact.ts` — pure validation.
- `lib/contact-submit.ts` — the only module that knows about Web3Forms.
- `components/contact-dialog-provider.tsx` — open state + one dialog instance.
- `components/contact-trigger.tsx` — a button that opens the dialog.
- `components/contact-dialog.tsx` — the panel.
- Tests alongside each.

**Modify:** `app/globals.css`, `app/layout.tsx`, `components/hero-section.tsx`,
`components/cta-section.tsx`, `components/site-footer.tsx`,
`components/what-we-do-section.tsx`, `components/services-section.tsx`,
`components/chat-conversation.tsx`, `components/chat-message-row.tsx`,
`components/live-clock.tsx`, `components/liquid-ether-background.tsx`,
`lib/cta.ts`, `lib/footer.ts`, and the tests listed per task.

---

### Task 1: Motion tokens and the `js-motion` gate

**Files:**
- Create: `lib/motion.ts`
- Create: `lib/motion.test.ts`
- Modify: `app/globals.css` (append at end)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write the failing test**

Create `lib/motion.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest'
import { MOTION_GATE_CLASS, isMotionEnabled } from './motion'

afterEach(() => {
  document.documentElement.classList.remove(MOTION_GATE_CLASS)
})

describe('isMotionEnabled', () => {
  it('is false until the gate class is present', () => {
    expect(isMotionEnabled()).toBe(false)
  })

  it('is true once the head script has added the gate class', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    expect(isMotionEnabled()).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `Failed to resolve import "./motion"`.

- [ ] **Step 3: Write the implementation**

Create `lib/motion.ts`:

```ts
/**
 * Set on `<html>` by the inline script in `app/layout.tsx`, before first paint,
 * when reveal animations may run.
 *
 * The class is the single source of truth shared by the CSS hidden-initial
 * states and the JS that advances them, so the two can never disagree and
 * leave an element permanently invisible. The conditions live in that script
 * rather than here because it has to be self-contained — it runs before any
 * module loads.
 */
export const MOTION_GATE_CLASS = 'js-motion'

export function isMotionEnabled(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains(MOTION_GATE_CLASS)
}

/** Beat between staggered siblings entering. */
export const STAGGER_MS = 90

/**
 * Where an element counts as having arrived. Trimming the bottom of the root
 * box anchors the trigger just inside the lower edge, so content reveals as it
 * rises into view rather than while it is still off-screen.
 */
export const REVEAL_ROOT_MARGIN = '0px 0px -12% 0px'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Add the tokens to `app/globals.css`**

Append to the end of `app/globals.css`:

```css
/* Motion tokens -------------------------------------------------------------
   Durations and easings used to be scattered literals — duration-500,
   duration-700, TYPING_MS, takeoverDuration — with `ease-out` appearing
   exactly once and everything else falling back to the browser default.

   Easings go in @theme because Tailwind's --ease-* namespace generates
   utilities from them. Durations cannot: Tailwind 4.3 has no --duration-*
   namespace (a --duration-base in @theme emits the variable but no class), so
   the scale is declared as real utilities instead. */
@theme {
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --animate-chat-typing: chat-typing 1400ms var(--ease-out-quad) infinite;
}

@utility duration-instant {
  transition-duration: 120ms;
}
@utility duration-fast {
  transition-duration: 200ms;
}
@utility duration-base {
  transition-duration: 320ms;
}
@utility duration-slow {
  transition-duration: 520ms;
}
@utility duration-deliberate {
  transition-duration: 700ms;
}

/* The site had no focus styling at all, and the inherited --ring is a mid-grey
   that disappears against carbon-black. Lime is the only colour on the palette
   that survives on every surface here. */
@utility focus-ring {
  &:focus-visible {
    outline: 2px solid var(--color-lime);
    outline-offset: 2px;
  }
}

@keyframes chat-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* Scroll reveals ------------------------------------------------------------
   The hidden-initial state is CSS gated on `.js-motion`, not React state.
   React settles after hydration, which is after first paint — so a
   state-driven reveal paints its content and then blanks it. The gate class
   lands before first paint, so the element is hidden from frame one, while the
   server HTML stays fully visible for no-JS, reduced motion and crawlers. */
[data-reveal] {
  transition:
    opacity 520ms var(--ease-out-expo),
    transform 520ms var(--ease-out-expo);
  transition-delay: var(--reveal-delay, 0ms);
}

.js-motion [data-reveal='pending'] {
  opacity: 0;
  transform: translateY(12px);
}

/* Same mechanism for the chat thread, which had exactly this bug: all twelve
   messages painted, then blanked when `armed` flipped. */
.js-motion [data-chat-row][data-phase='initial'] {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: none;
  }
}
```

- [ ] **Step 6: Add the gate script to `app/layout.tsx`**

Replace the whole file with:

```tsx
import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import { MOTION_GATE_CLASS } from '@/lib/motion'
import './globals.css'

export const metadata: Metadata = {
  title: 'Norn — Growth Design',
  description:
    'Do experimento ao resultado: a gente acelera suas iniciativas digitais por dentro.',
}

/**
 * Runs before first paint so the hidden-initial states in globals.css apply
 * from frame one. React state cannot do this — it settles after hydration,
 * which is after the first paint.
 *
 * The class means "reveal animations will run", so it checks the same two
 * conditions the JS guards do. A browser that cannot advance a reveal never
 * gets the class and therefore never hides anything.
 *
 * Self-contained by necessity: this executes before any module loads, so it
 * cannot import MOTION_GATE_CLASS — the constant is interpolated in instead.
 */
const motionGateScript = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window)document.documentElement.classList.add("${MOTION_GATE_CLASS}")`

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGateScript }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Verify the tokens actually compile into utilities**

Run: `npm run build`
Expected: build succeeds. Then confirm the utilities exist:

Run: `grep -ro "duration-base\|ease-out-expo\|focus-ring" out/_next/static/chunks/*.css | head`
Expected: no output yet — nothing uses them until later tasks. This step only
confirms the build does not error on the `@utility` and `@theme` syntax.

- [ ] **Step 8: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts app/globals.css app/layout.tsx
git commit -m "feat: add motion tokens and the pre-paint motion gate"
```

---

### Task 2: The `Reveal` primitive

**Files:**
- Create: `components/ui/reveal.tsx`
- Create: `components/ui/reveal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/ui/reveal.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Reveal } from './reveal'
import { MOTION_GATE_CLASS } from '@/lib/motion'

type IntersectionCallback = (
  entries: Array<{
    isIntersecting: boolean
    boundingClientRect: { top: number }
    rootBounds: { bottom: number } | null
  }>
) => void

let observers: IntersectionCallback[] = []

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []

  constructor(callback: IntersectionCallback) {
    observers.push(callback)
  }

  observe = () => {}
  unobserve = () => {}
  takeRecords = () => []
  disconnect = () => {}
}

afterEach(() => {
  observers = []
  document.documentElement.classList.remove(MOTION_GATE_CLASS)
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>conteudo</Reveal>)

    expect(screen.getByText('conteudo')).toBeInTheDocument()
  })

  it('stays pending until it enters, then flips to visible', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)
    const element = screen.getByText('conteudo')
    expect(element).toHaveAttribute('data-reveal', 'pending')

    act(() => {
      observers[0]([
        {
          isIntersecting: true,
          boundingClientRect: { top: 100 },
          rootBounds: { bottom: 800 },
        },
      ])
    })

    expect(element).toHaveAttribute('data-reveal', 'visible')
  })

  it('reveals content the visitor has already scrolled past', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)

    act(() => {
      // Never reports as intersecting, so only the trigger-line check can
      // rescue it. A restored scroll position would otherwise strand it.
      observers[0]([
        {
          isIntersecting: false,
          boundingClientRect: { top: -400 },
          rootBounds: { bottom: 800 },
        },
      ])
    })

    expect(screen.getByText('conteudo')).toHaveAttribute(
      'data-reveal',
      'visible'
    )
  })

  it('never observes when the motion gate is absent', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)

    // The CSS hidden state is gated on the same class, so with no gate the
    // element is already visible and there is nothing to reveal.
    expect(observers).toHaveLength(0)
  })

  it('carries the stagger delay as a custom property', () => {
    render(<Reveal delay={180}>conteudo</Reveal>)

    expect(screen.getByText('conteudo').style.getPropertyValue('--reveal-delay')).toBe(
      '180ms'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/ui/reveal.test.tsx`
Expected: FAIL — `Failed to resolve import "./reveal"`.

- [ ] **Step 3: Write the implementation**

Create `components/ui/reveal.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { REVEAL_ROOT_MARGIN, isMotionEnabled } from '@/lib/motion'

/**
 * Fades and rises its children when they enter the viewport, once.
 *
 * The hidden state itself lives in globals.css keyed on `[data-reveal]` and
 * the `js-motion` gate, not here — see the comment in that file for why React
 * state cannot own it without flashing.
 *
 * Wrap block-level groups, not individual grid items. `SpotlightGroup`
 * measures its cards with `offsetLeft`/`offsetTop`, and putting a wrapper
 * around each card changes what those are relative to.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!isMotionEnabled()) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const triggerLine = entry.rootBounds?.bottom
          // Content already scrolled past never reports as intersecting, so
          // check the trigger line directly too. Otherwise a restored scroll
          // position leaves it hidden forever.
          const crossed =
            entry.isIntersecting ||
            (triggerLine !== undefined &&
              entry.boundingClientRect.top < triggerLine)
          if (!crossed) continue

          observer.disconnect()
          setRevealed(true)
          return
        }
      },
      { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal={revealed ? 'visible' : 'pending'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/ui/reveal.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add components/ui/reveal.tsx components/ui/reveal.test.tsx
git commit -m "feat: add a Reveal primitive for scroll entrances"
```

---

### Task 3: Fix the chat first-paint flash

`ChatConversation` arms in a `setTimeout(0)`, so all twelve messages render
visible and then blank. Task 1 added the CSS half of the fix; this task moves
the JS half onto the same gate.

**Files:**
- Modify: `components/chat-conversation.tsx:60-75`
- Modify: `components/chat-message-row.tsx:107-118`
- Modify: `components/chat-conversation.test.tsx`

- [ ] **Step 1: Update the test to drive the gate**

In `components/chat-conversation.test.tsx`, change the `beforeEach`/`afterEach`
blocks to add and remove the gate class, and drop the now-meaningless
`matchMedia` stub:

```tsx
import { MOTION_GATE_CLASS } from '@/lib/motion'

// …

  beforeEach(() => {
    observers = []
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    // The gate replaces the old matchMedia + IntersectionObserver checks:
    // the head script resolves both before first paint, and the conversation
    // reads only its result.
    document.documentElement.classList.add(MOTION_GATE_CLASS)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.documentElement.classList.remove(MOTION_GATE_CLASS)
  })
```

Then replace the last two tests in the file:

```tsx
  it('leaves everything visible when the motion gate is absent', () => {
    document.documentElement.classList.remove(MOTION_GATE_CLASS)

    renderConversation(['client', 'norn'])
    arm()

    expect(phases()).toEqual(['initial', 'initial'])
    expect(observers).toHaveLength(0)
  })

  it('marks rows so the gate stylesheet can hide them before first paint', () => {
    renderConversation(['client', 'norn'])

    for (const row of screen.getAllByTestId('chat-row')) {
      expect(row).toHaveAttribute('data-chat-row')
    }
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/chat-conversation.test.tsx`
Expected: FAIL — "leaves everything visible when the motion gate is absent"
fails because the component still arms off `matchMedia`, and
"marks rows…" fails because `data-chat-row` does not exist yet.

- [ ] **Step 3: Move the arming check onto the gate**

In `components/chat-conversation.tsx`, replace the `prefersReducedMotion`
import with the gate helper:

```tsx
import { isMotionEnabled } from '@/lib/motion'
```

(delete the `import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'`
line — that module is still used by `spotlight-card.tsx`, so leave the file
itself alone).

Then replace the arming effect:

```tsx
  useEffect(() => {
    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const timeoutId = setTimeout(() => {
      // One gate for both halves of the reveal: globals.css hides the rows off
      // the same class, so the cursor can never be left unable to advance rows
      // the stylesheet has already hidden.
      if (!isMotionEnabled()) return
      setArmed(true)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])
```

- [ ] **Step 4: Add the styling hook to the row**

In `components/chat-message-row.tsx`, add `data-chat-row` to the row element.
Change:

```tsx
    <div
      ref={rowRef}
      data-testid="chat-row"
      data-phase={phase}
```

to:

```tsx
    <div
      ref={rowRef}
      // A styling hook distinct from the test id: globals.css keys the
      // before-first-paint hidden state off this, and stylesheets should not
      // depend on test selectors.
      data-chat-row=""
      data-testid="chat-row"
      data-phase={phase}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run components/chat-conversation.test.tsx components/chat-message-row.test.tsx`
Expected: PASS, all tests in both files.

- [ ] **Step 6: Commit**

```bash
git add components/chat-conversation.tsx components/chat-message-row.tsx components/chat-conversation.test.tsx
git commit -m "fix: stop the chat conversation flashing before it reveals"
```

---

### Task 4: Give the typing dots a real typing rhythm

`animate-pulse` is a 2s opacity fade — it reads as a loading skeleton, and the
0/150/300ms offsets are imperceptible against that cycle.

**Files:**
- Modify: `components/chat-message-row.tsx:9-27`
- Create: `components/chat-typing-dots.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/chat-typing-dots.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatTypingDots } from './chat-message-row'

describe('ChatTypingDots', () => {
  it('bounces rather than pulsing like a loading skeleton', () => {
    const { container } = render(
      <span data-testid="dots">
        <ChatTypingDots />
      </span>
    )

    const dots = container.querySelectorAll('span[style]')
    expect(dots).toHaveLength(3)
    for (const dot of dots) {
      expect(dot.className).toContain('animate-chat-typing')
      expect(dot.className).not.toContain('animate-pulse')
    }
  })

  it('offsets each dot so the bounce travels along the row', () => {
    const { container } = render(<ChatTypingDots />)

    const delays = Array.from(container.querySelectorAll('span[style]')).map(
      (dot) => (dot as HTMLElement).style.animationDelay
    )
    expect(delays).toEqual(['0ms', '160ms', '320ms'])
  })

  it('stays out of the accessibility tree', () => {
    render(
      <span data-testid="wrapper">
        <ChatTypingDots />
      </span>
    )

    expect(
      screen.getByTestId('wrapper').firstElementChild
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/chat-typing-dots.test.tsx`
Expected: FAIL — delays are `['0ms','150ms','300ms']` and the class is
`animate-pulse`.

- [ ] **Step 3: Write the implementation**

In `components/chat-message-row.tsx`, replace lines 9-27 (the `dotDelays`
constant and the whole `ChatTypingDots` function) with:

```tsx
// Offsets tuned to the 1400ms keyframe in globals.css: spread far enough apart
// that the bounce visibly travels along the row rather than the three dots
// moving as one.
const dotDelays = ['0ms', '160ms', '320ms']

export function ChatTypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {dotDelays.map((delay, index) => (
        <span
          key={delay}
          // Inline style, not `delay-*`: Tailwind core's delay utilities shadow
          // tw-animate-css and emit transition-delay, not animation-delay.
          style={{ animationDelay: delay }}
          className={`h-1.5 w-1.5 rounded-full motion-reduce:animate-none animate-chat-typing ${
            index === dotDelays.length - 1 ? 'bg-lime' : 'bg-platinum-gray'
          }`}
        />
      ))}
    </span>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run components/chat-typing-dots.test.tsx components/chat-message-row.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/chat-message-row.tsx components/chat-typing-dots.test.tsx
git commit -m "feat: replace the pulsing typing dots with a travelling bounce"
```

---

### Task 5: Focus and hover states across the site

The site has no `focus-visible` styling anywhere, and most controls have no
hover state. This is the most severe finding in the review.

**Files:**
- Modify: `components/hero-section.tsx:36-53`
- Modify: `components/site-footer.tsx:29-36`
- Modify: `components/what-we-do-section.tsx:63-79` and `:88-96`
- Modify: `components/services-section.tsx:29-33`
- Create: `components/interaction-states.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/interaction-states.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServicesSection } from './services-section'
import { SiteFooter } from './site-footer'
import { WhatWeDoSection } from './what-we-do-section'

vi.mock('@/components/LiquidEther', () => ({ default: () => null }))

describe('interaction states', () => {
  it('gives every footer link a visible focus ring', () => {
    render(<SiteFooter />)

    for (const link of screen.getAllByRole('link')) {
      expect(link.className).toContain('focus-ring')
    }
  })

  it('lifts the service cards on hover', () => {
    const { container } = render(<ServicesSection />)

    const cards = container.querySelectorAll('[data-spotlight-card]')
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.className).toContain('hover:-translate-y-0.5')
      // A transform with no reduced-motion escape hatch is the exact thing
      // the media query exists to suppress.
      expect(card.className).toContain('motion-reduce:transition-none')
    }
  })

  it('responds to hover on the skill chips', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('UI/UX').parentElement?.className).toContain(
      'hover:bg-alabaster/20'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/interaction-states.test.tsx`
Expected: FAIL — none of those classes are present.

- [ ] **Step 3: Update the footer links**

In `components/site-footer.tsx`, change the link `className` to:

```tsx
                    className="focus-ring rounded-sm font-body text-xs font-medium tracking-[0.02em] text-platinum-gray transition-colors duration-instant hover:text-lime motion-reduce:transition-none"
```

- [ ] **Step 4: Update the service cards**

In `components/services-section.tsx`, change the `SpotlightCard` `className` to:

```tsx
              className="flex h-full flex-col gap-3 rounded-2xl border border-alabaster/10 border-l-alabaster/25 bg-alabaster/5 p-6 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none"
```

- [ ] **Step 5: Update the WhatWeDo cards and chips**

In `components/what-we-do-section.tsx`, add the same hover treatment to all
three `SpotlightCard` elements by appending this to each of their existing
`className` strings:

```
 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none
```

Then change the skill chip `div` `className` to:

```tsx
                  className="flex items-center gap-2 rounded-xl bg-alabaster/10 px-3 py-3 transition-colors duration-instant hover:bg-alabaster/20 motion-reduce:transition-none"
```

And the building tag `span` `className` to:

```tsx
                  className="rounded-full bg-alabaster/10 px-3 py-1 font-body text-sm text-alabaster transition-colors duration-instant hover:bg-alabaster/20 motion-reduce:transition-none"
```

- [ ] **Step 6: Update the hero links**

In `components/hero-section.tsx`, replace the two anchors (lines 38-52) with:

```tsx
            <a
              href="#servicos"
              // Underline wipes in from the left rather than appearing at full
              // width: a 0%-to-100% background-size is the only way to animate
              // an underline, since text-decoration cannot be transitioned.
              className="focus-ring rounded-sm bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 font-body text-sm font-medium text-lime transition-[background-size] duration-fast ease-out-quad hover:bg-[length:100%_1px] motion-reduce:transition-none"
            >
              Ver serviços
            </a>
```

Leave the "Iniciar Projeto" anchor alone for now — Task 14 replaces it with a
dialog trigger and styles it there.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run components/interaction-states.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 8: Run the full suite to check nothing regressed**

Run: `npm test`
Expected: PASS. `services-section.test.tsx` and `what-we-do-section.test.tsx`
assert on content, not on the class strings that changed, so they should be
unaffected.

- [ ] **Step 9: Commit**

```bash
git add components/site-footer.tsx components/services-section.tsx components/what-we-do-section.tsx components/hero-section.tsx components/interaction-states.test.tsx
git commit -m "feat: add focus rings and hover states across the site"
```

---

### Task 6: Apply `Reveal` to the static sections

**Files:**
- Modify: `components/what-we-do-section.tsx`
- Modify: `components/services-section.tsx`
- Modify: `components/cta-section.tsx`
- Modify: `components/hero-section.tsx`

Wrap block-level groups, not individual grid items — `SpotlightGroup` measures
its cards with `offsetLeft`/`offsetTop`, and a wrapper per card changes what
those are relative to.

- [ ] **Step 1: Reveal the WhatWeDo section**

In `components/what-we-do-section.tsx`, add the import:

```tsx
import { Reveal } from '@/components/ui/reveal'
import { STAGGER_MS } from '@/lib/motion'
```

Then wrap the eyebrow and the group, replacing the contents of the
`<div className="mx-auto flex max-w-5xl flex-col gap-6">`:

```tsx
        <Reveal>
          <SectionEyebrow>O que estamos fazendo</SectionEyebrow>
        </Reveal>

        <Reveal delay={STAGGER_MS}>
          <SpotlightGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* … cards unchanged … */}
          </SpotlightGroup>
        </Reveal>
```

- [ ] **Step 2: Reveal the Services section**

In `components/services-section.tsx`, add the same two imports, then wrap:

```tsx
        <Reveal>
          <SectionEyebrow>{servicesEyebrow}</SectionEyebrow>
        </Reveal>

        <Reveal delay={STAGGER_MS} className="flex flex-col gap-6">
          <h2 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-4xl">
            {servicesHeading}
          </h2>
          <p className="max-w-md font-body text-base text-platinum-gray">
            {servicesSubheading}
          </p>
        </Reveal>

        <Reveal delay={STAGGER_MS * 2}>
          <SpotlightGroup className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* … cards unchanged … */}
          </SpotlightGroup>
        </Reveal>
```

- [ ] **Step 3: Reveal the CTA section**

In `components/cta-section.tsx`, add the same two imports, then replace the
contents of the `<div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6">`:

```tsx
        <Reveal>
          <SectionEyebrow tone="carbon">{ctaEyebrow}</SectionEyebrow>
        </Reveal>

        <Reveal delay={STAGGER_MS} className="flex flex-col gap-6">
          <h2 className="max-w-2xl font-heading text-3xl font-black leading-tight text-carbon-black md:text-5xl">
            {ctaHeading}
          </h2>
          <p className="max-w-md font-body text-base text-carbon-black/80">
            {ctaSubheading}
          </p>
        </Reveal>

        <Reveal delay={STAGGER_MS * 2} className="w-full md:w-auto">
          <a
            href={ctaHref}
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-carbon-black px-8 py-4 font-heading text-lg font-black text-alabaster transition-colors hover:bg-carbon-black/90 md:w-auto"
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
          </a>
        </Reveal>
```

The anchor is unchanged here on purpose — Task 14 replaces it with the dialog
trigger, and changing it twice would make that diff harder to read.

- [ ] **Step 4: Reveal the hero**

In `components/hero-section.tsx`, add the imports and wrap the headline, the
paragraph and the CTA row:

```tsx
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Reveal>
            <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-[0.02em] text-alabaster md:text-6xl lg:text-7xl">
              {/* … spans unchanged … */}
            </h1>
          </Reveal>

          <Reveal delay={STAGGER_MS}>
            <p className="max-w-sm font-body text-base text-platinum-gray">
              Do experimento ao resultado: a gente acelera suas iniciativas
              digitais por dentro.
            </p>
          </Reveal>

          <Reveal delay={STAGGER_MS * 2}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* … both CTAs unchanged … */}
            </div>
          </Reveal>
        </div>
```

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS. The section tests query by text and role, both of which survive
the extra wrapper element.

- [ ] **Step 6: Verify visually**

Run: `npm run dev`, open http://localhost:3000, and scroll the whole page.
Expected: every section fades and rises as it arrives; nothing flashes on load.
Then set the OS to "reduce motion" and reload — everything is present
immediately with no movement.

- [ ] **Step 7: Commit**

```bash
git add components/what-we-do-section.tsx components/services-section.tsx components/cta-section.tsx components/hero-section.tsx
git commit -m "feat: reveal the static sections as they enter the viewport"
```

---

### Task 7: Honour reduced motion in the hero background

`LiquidEtherBackground` checks only `isTouchDevice()`. A full-screen WebGL
fluid animating behind the headline is the exact case the media query exists
for.

**Files:**
- Modify: `components/liquid-ether-background.tsx`
- Modify: `components/liquid-ether-background.test.tsx`

- [ ] **Step 1: Rewrite the test**

Replace `components/liquid-ether-background.test.tsx` entirely:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiquidEtherBackground } from './liquid-ether-background'

const { liquidEtherMock } = vi.hoisted(() => ({
  liquidEtherMock: vi.fn<(props: unknown) => null>(() => null),
}))

vi.mock('@/components/LiquidEther', () => ({
  default: (props: unknown) => liquidEtherMock(props),
}))

/**
 * The old stub answered every query the same way, which cannot express
 * "touch device that does not want motion" — the case that matters most here.
 */
function stubMedia({
  reducedMotion = false,
  touch = false,
}: {
  reducedMotion?: boolean
  touch?: boolean
}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : touch,
    }))
  )
}

describe('LiquidEtherBackground', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    liquidEtherMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function settle() {
    act(() => {
      vi.advanceTimersByTime(0)
    })
  }

  it('enables auto demo on devices with no hover and a coarse pointer', () => {
    stubMedia({ touch: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: true })
    )
  })

  it('keeps auto demo off on devices with a mouse', () => {
    stubMedia({ touch: false })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: false })
    )
  })

  it('renders a static wash instead of the fluid under reduced motion', () => {
    stubMedia({ reducedMotion: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(screen.getByTestId('liquid-ether-static')).toBeInTheDocument()
    // Never mounted, not mounted-then-torn-down: WebGL context creation is
    // the expensive part and reduced-motion visitors should not pay it.
    expect(liquidEtherMock).not.toHaveBeenCalled()
  })

  it('respects reduced motion even on a touch device', () => {
    stubMedia({ reducedMotion: true, touch: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/liquid-ether-background.test.tsx`
Expected: FAIL — the two reduced-motion tests fail, because the component still
mounts `LiquidEther` unconditionally.

- [ ] **Step 3: Write the implementation**

Replace `components/liquid-ether-background.tsx` entirely:

```tsx
'use client'

import { useEffect, useState } from 'react'
import LiquidEther from '@/components/LiquidEther'
import { isTouchDevice } from '@/lib/is-touch-device'
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'

/**
 * `pending` until the media queries are read. Resolving before the first mount
 * rather than after means a reduced-motion visitor never pays for a WebGL
 * context that is torn down on the next tick.
 */
type BackgroundMode = 'pending' | 'fluid-auto' | 'fluid-pointer' | 'static'

export function LiquidEtherBackground() {
  const [mode, setMode] = useState<BackgroundMode>('pending')

  useEffect(() => {
    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const timeoutId = setTimeout(() => {
      if (prefersReducedMotion()) {
        setMode('static')
        return
      }
      setMode(isTouchDevice() ? 'fluid-auto' : 'fluid-pointer')
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  if (mode === 'pending') return null

  if (mode === 'static') {
    // Not simply nothing: the hero composition is built around a lime presence
    // behind the headline, and dropping to bare carbon flattens it. This keeps
    // the colour without the movement.
    return (
      <div
        data-testid="liquid-ether-static"
        className="h-full w-full bg-[radial-gradient(60%_50%_at_50%_45%,color-mix(in_oklab,var(--color-lime)_16%,transparent),transparent_70%)]"
      />
    )
  }

  return (
    <LiquidEther
      mouseForce={20}
      cursorSize={100}
      isViscous
      viscous={30}
      colors={['#C6F432', '#C6F432', '#C6F432']}
      autoDemo={mode === 'fluid-auto'}
      autoSpeed={0.5}
      autoIntensity={2.2}
      isBounce={false}
      resolution={0.5}
    />
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run components/liquid-ether-background.test.tsx components/hero-section.test.tsx`
Expected: `liquid-ether-background.test.tsx` PASS with 4 tests.
`hero-section.test.tsx` may fail its "mounts the LiquidEther background" case,
because jsdom has no `matchMedia` by default and the mode never resolves past
`pending`. If it does, add a `matchMedia` stub to that test's setup:

```tsx
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })
```

and wrap the render in `act` + `vi.advanceTimersByTime(0)` as the other tests
do. Note that `hero-section.test.tsx` mocks `@/components/LiquidEther`
directly, so it exercises `LiquidEtherBackground` for real.

- [ ] **Step 5: Commit**

```bash
git add components/liquid-ether-background.tsx components/liquid-ether-background.test.tsx components/hero-section.test.tsx
git commit -m "fix: honour reduced motion in the hero background"
```

---

### Task 8: Smooth in-page scrolling

**Files:**
- Modify: `app/globals.css` (the `@layer base` block, lines 128-138)

- [ ] **Step 1: Add the scroll rules**

In `app/globals.css`, extend the existing `@layer base` block:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
    scroll-behavior: smooth;
  }
  /* The anchors land flush against the viewport top otherwise, with the
     section eyebrow touching the edge. */
  [id] {
    scroll-margin-top: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, then click "Ver serviços" in the hero and each footer link.
Expected: the page glides to the section and stops with a 2rem gap above the
eyebrow, rather than jumping.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: scroll smoothly to the in-page anchors"
```

---

### Task 9: Stop the clock shifting the hero header

`LiveClock` returns `null` until hydration, so the header's right side pops in.

**Files:**
- Modify: `components/live-clock.tsx`
- Modify: `components/live-clock.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `components/live-clock.test.tsx`, inside the `describe`:

```tsx
  it('reserves its width before the time resolves', () => {
    render(<LiveClock />)

    // Rendering nothing until hydration shifts everything beside it in the
    // hero header. The placeholder is the same shape as HH:MM:SS.
    expect(screen.getByText('LIVE · --:--:--')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/live-clock.test.tsx`
Expected: FAIL — "Unable to find an element with the text: LIVE · --:--:--".

- [ ] **Step 3: Write the implementation**

Replace `components/live-clock.tsx` entirely:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { formatClockTime } from '@/lib/format-time'

/** Same shape as HH:MM:SS, so the header does not reflow when the time lands. */
const PLACEHOLDER = '--:--:--'

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    // Deferred into timer callbacks (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const update = () => setTime(formatClockTime(new Date()))
    const timeoutId = setTimeout(update, 0)
    const intervalId = setInterval(update, 1000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.02em] tabular-nums text-alabaster">
      {/* Dimmed until the clock is live, so the placeholder does not read as a
          real reading. */}
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-base ${
          time === null ? 'bg-alabaster/30' : 'bg-lime'
        }`}
      />
      <span>LIVE · {time ?? PLACEHOLDER}</span>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run components/live-clock.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add components/live-clock.tsx components/live-clock.test.tsx
git commit -m "fix: reserve the clock's width so the hero header stops shifting"
```

---

### Task 10: Collapse the duplicated signature

`NORNGROWTHDESIGN · SINCE 2026` is hardcoded in `what-we-do-section.tsx:75` and
also exported as `footerSignature` from `lib/footer.ts`.

**Files:**
- Modify: `lib/footer.ts`
- Modify: `components/what-we-do-section.tsx:73-77`

- [ ] **Step 1: Rename the constant to reflect that it is shared**

In `lib/footer.ts`, replace the `footerSignature` export with:

```ts
/** Used by the footer and by the manifesto card in WhatWeDo. */
export const brandSignature = 'NORNGROWTHDESIGN · SINCE 2026'
```

- [ ] **Step 2: Update both call sites**

In `components/site-footer.tsx`, change the import and the usage from
`footerSignature` to `brandSignature`.

In `components/what-we-do-section.tsx`, add the import:

```tsx
import { brandSignature } from '@/lib/footer'
```

and replace the hardcoded string:

```tsx
            <p className="font-body text-xs font-medium tracking-[0.02em] text-platinum-gray">
              {brandSignature}
            </p>
```

- [ ] **Step 3: Update the footer test**

In `components/site-footer.test.tsx`, change the `footerSignature` import and
references to `brandSignature`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run components/site-footer.test.tsx components/what-we-do-section.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/footer.ts components/site-footer.tsx components/site-footer.test.tsx components/what-we-do-section.tsx
git commit -m "refactor: share one brand signature constant"
```

---

### Task 11: Contact copy and validation

**Files:**
- Create: `lib/contact.ts`
- Create: `lib/validate-contact.ts`
- Create: `lib/validate-contact.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/validate-contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isValid, validateContact } from './validate-contact'

const good = {
  name: 'Rodrigo',
  email: 'rodrigo@deployux.com',
  message: 'A conversão do onboarding caiu 30% no último mês.',
}

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    expect(validateContact(good)).toEqual({})
    expect(isValid(validateContact(good))).toBe(true)
  })

  it('rejects a blank name', () => {
    expect(validateContact({ ...good, name: '   ' })).toHaveProperty('name')
  })

  it('rejects an address with no domain', () => {
    expect(validateContact({ ...good, email: 'rodrigo@' })).toHaveProperty(
      'email'
    )
  })

  it('rejects an address with no at sign', () => {
    expect(
      validateContact({ ...good, email: 'rodrigo.deployux.com' })
    ).toHaveProperty('email')
  })

  it('rejects a message too short to act on', () => {
    expect(validateContact({ ...good, message: 'oi' })).toHaveProperty(
      'message'
    )
  })

  it('does not count surrounding whitespace towards the message length', () => {
    expect(
      validateContact({ ...good, message: '   oi     ' })
    ).toHaveProperty('message')
  })

  it('reports every problem at once rather than one at a time', () => {
    const errors = validateContact({ name: '', email: 'x', message: '' })

    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
    expect(isValid(errors)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/validate-contact.test.ts`
Expected: FAIL — `Failed to resolve import "./validate-contact"`.

- [ ] **Step 3: Write the validation module**

Create `lib/validate-contact.ts`:

```ts
export type ContactValues = {
  name: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>

export const MESSAGE_MIN_LENGTH = 10

/**
 * Deliberately loose: something@something.something. Anything stricter starts
 * rejecting valid addresses, and the real test of an address is whether the
 * reply lands in it.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Returns every problem at once, keyed by field. Revealing errors one at a
 * time makes a three-field form feel like an interrogation.
 */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}

  if (values.name.trim() === '') {
    errors.name = 'Diz seu nome pra gente.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Confere o e-mail: sem ele a gente não consegue responder.'
  }

  if (values.message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = 'Conta um pouco mais — pelo menos uma frase.'
  }

  return errors
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/validate-contact.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Write the copy module**

Create `lib/contact.ts`:

```ts
// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.

/**
 * Public by design. Web3Forms access keys are client-side keys, and this is a
 * static export — there is nowhere to hide one, since NEXT_PUBLIC_* values are
 * inlined into the bundle at build time anyway.
 *
 * The exposure is inbox spam, not account compromise. The honeypot in
 * `contact-submit.ts` and Web3Forms' own filtering are the mitigation; the key
 * can be rotated from their dashboard if it is ever abused.
 */
export const WEB3FORMS_ACCESS_KEY = '4d062bc0-bcbe-4889-87f7-a3bc1cb2b2b1'

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

// The button label is NOT re-declared here. `ctaLabel` in `lib/cta.ts` already
// holds 'Iniciar Projeto' and both triggers import it from there — a second
// copy is the same duplication Task 10 exists to remove.

export const contactTitle = 'Vamos começar.'

export const contactDescription =
  'Conta o contexto em duas linhas. A gente responde em até 1 dia útil.'

// Echoes the chat script's opening question on purpose: the dialog is the same
// conversation, continued.
export const contactNameQuestion = 'Como você se chama?'
export const contactEmailQuestion = 'Para qual e-mail a gente responde?'
export const contactMessageQuestion = 'Qual problema te tira o sono hoje?'

export const contactSubmitLabel = 'Enviar'
export const contactSubmittingLabel = 'Enviando'
export const contactCloseLabel = 'Fechar'

export const contactSuccessTitle = 'Recebido.'
export const contactSuccessBody =
  'Sua mensagem chegou. A gente responde em até 1 dia útil.'

export const contactErrorMessage =
  'Não conseguimos enviar agora. Tenta de novo em instantes.'
```

- [ ] **Step 6: Commit**

```bash
git add lib/contact.ts lib/validate-contact.ts lib/validate-contact.test.ts
git commit -m "feat: add contact copy and submission validation"
```

---

### Task 12: The Web3Forms submission

**Files:**
- Create: `lib/contact-submit.ts`
- Create: `lib/contact-submit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/contact-submit.test.ts`:

```ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { submitContact } from './contact-submit'
import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from './contact'

const submission = {
  name: '  Rodrigo  ',
  email: '  rodrigo@deployux.com ',
  message: '  A conversão caiu 30%.  ',
  botcheck: '',
}

function stubFetch(response: { ok: boolean } | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response as Response)
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function bodyOf(fetchMock: ReturnType<typeof stubFetch>) {
  return JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitContact', () => {
  it('posts to Web3Forms with the access key', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(fetchMock.mock.calls[0][0]).toBe(WEB3FORMS_ENDPOINT)
    expect(bodyOf(fetchMock).access_key).toBe(WEB3FORMS_ACCESS_KEY)
  })

  it('trims the values before sending them', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    const body = bodyOf(fetchMock)
    expect(body.name).toBe('Rodrigo')
    expect(body.email).toBe('rodrigo@deployux.com')
    expect(body.message).toBe('A conversão caiu 30%.')
  })

  it('sets replyto so a reply reaches the sender directly', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(bodyOf(fetchMock).replyto).toBe('rodrigo@deployux.com')
  })

  it('names the sender in the subject line', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(bodyOf(fetchMock).subject).toBe('Novo projeto — Rodrigo')
  })

  it('forwards the honeypot so Web3Forms can drop bot submissions', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact({ ...submission, botcheck: 'on' })

    expect(bodyOf(fetchMock).botcheck).toBe('on')
  })

  it('reports failure when the endpoint rejects the submission', async () => {
    stubFetch({ ok: false })

    expect(await submitContact(submission)).toEqual({ ok: false })
  })

  it('reports failure when the network is unreachable', async () => {
    stubFetch(new Error('offline'))

    // A thrown fetch and a 500 leave the visitor in the same position, so the
    // caller gets one branch rather than two.
    expect(await submitContact(submission)).toEqual({ ok: false })
  })

  it('reports success when the endpoint accepts it', async () => {
    stubFetch({ ok: true })

    expect(await submitContact(submission)).toEqual({ ok: true })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/contact-submit.test.ts`
Expected: FAIL — `Failed to resolve import "./contact-submit"`.

- [ ] **Step 3: Write the implementation**

Create `lib/contact-submit.ts`:

```ts
import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '@/lib/contact'
import type { ContactValues } from '@/lib/validate-contact'

export type ContactSubmission = ContactValues & {
  /**
   * Value of the hidden honeypot input. Web3Forms drops the submission when it
   * arrives non-empty — a human never sees the field, so only a bot fills it.
   */
  botcheck: string
}

export type ContactResult = { ok: boolean }

/**
 * The only module that knows about Web3Forms.
 *
 * Returns a result rather than throwing: a network rejection and a non-OK
 * response leave the visitor in exactly the same position, so the caller gets
 * one branch to render instead of two.
 */
export async function submitContact(
  submission: ContactSubmission
): Promise<ContactResult> {
  const name = submission.name.trim()
  const email = submission.email.trim()

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Novo projeto — ${name}`,
        from_name: 'Norn Studio',
        name,
        email,
        message: submission.message.trim(),
        // Makes Reply in Gmail address the lead rather than Web3Forms.
        replyto: email,
        botcheck: submission.botcheck,
      }),
    })

    return { ok: response.ok }
  } catch {
    return { ok: false }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/contact-submit.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/contact-submit.ts lib/contact-submit.test.ts
git commit -m "feat: submit contact enquiries through Web3Forms"
```

---

### Task 13: The contact dialog

**Files:**
- Create: `components/contact-dialog.tsx`
- Create: `components/contact-dialog-provider.tsx`
- Create: `components/contact-trigger.tsx`
- Create: `components/contact-dialog.test.tsx`
- Modify: `app/globals.css` (append the field-stagger rules)

- [ ] **Step 1: Write the failing test**

Create `components/contact-dialog.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactDialogProvider } from './contact-dialog-provider'
import { ContactTrigger } from './contact-trigger'
import {
  contactEmailQuestion,
  contactErrorMessage,
  contactMessageQuestion,
  contactNameQuestion,
  contactSubmitLabel,
  contactSuccessTitle,
} from '@/lib/contact'

const { submitMock } = vi.hoisted(() => ({
  submitMock: vi.fn(() => Promise.resolve({ ok: true })),
}))

vi.mock('@/lib/contact-submit', () => ({
  submitContact: submitMock,
}))

afterEach(() => {
  submitMock.mockClear()
  submitMock.mockResolvedValue({ ok: true })
})

function renderDialog() {
  return render(
    <ContactDialogProvider>
      <ContactTrigger>Iniciar Projeto</ContactTrigger>
    </ContactDialogProvider>
  )
}

async function openAndFill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
  await user.type(screen.getByLabelText(contactNameQuestion), 'Rodrigo')
  await user.type(
    screen.getByLabelText(contactEmailQuestion),
    'rodrigo@deployux.com'
  )
  await user.type(
    screen.getByLabelText(contactMessageQuestion),
    'A conversão do onboarding caiu 30%.'
  )
}

describe('ContactDialog', () => {
  it('stays closed until the trigger is used', () => {
    renderDialog()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from the trigger', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('labels every field, so the questions are real labels', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(screen.getByLabelText(contactNameQuestion)).toBeInTheDocument()
    expect(screen.getByLabelText(contactEmailQuestion)).toBeInTheDocument()
    expect(screen.getByLabelText(contactMessageQuestion)).toBeInTheDocument()
  })

  it('refuses to submit an incomplete form', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(submitMock).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Diz seu nome pra gente.')
    ).toBeInTheDocument()
  })

  it('submits a complete form and confirms it', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(await screen.findByText(contactSuccessTitle)).toBeInTheDocument()
    expect(submitMock).toHaveBeenCalledWith({
      name: 'Rodrigo',
      email: 'rodrigo@deployux.com',
      message: 'A conversão do onboarding caiu 30%.',
      botcheck: '',
    })
  })

  it('keeps what was typed when sending fails', async () => {
    submitMock.mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(await screen.findByText(contactErrorMessage)).toBeInTheDocument()
    // Losing three fields of typing to a flaky network is the worst possible
    // moment to make someone start over.
    expect(screen.getByLabelText(contactNameQuestion)).toHaveValue('Rodrigo')
    expect(screen.getByLabelText(contactMessageQuestion)).toHaveValue(
      'A conversão do onboarding caiu 30%.'
    )
  })

  it('hides the honeypot from people but leaves it in the form', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    const honeypot = document.querySelector('input[name="botcheck"]')
    expect(honeypot).toBeInTheDocument()
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot).toHaveAttribute('aria-hidden', 'true')
  })

  it('starts clean the next time it opens', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))
    await screen.findByText(contactSuccessTitle)

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(await screen.findByLabelText(contactNameQuestion)).toHaveValue('')
  })
})
```

- [ ] **Step 2: Install the user-event dependency**

Run: `npm install --save-dev @testing-library/user-event`
Expected: installs cleanly. The repo has no `user-event` yet, and typing into
fields through `fireEvent` would not exercise the real input path.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run components/contact-dialog.test.tsx`
Expected: FAIL — `Failed to resolve import "./contact-dialog-provider"`.

- [ ] **Step 4: Write the provider**

Create `components/contact-dialog-provider.tsx`:

```tsx
'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ContactDialog } from '@/components/contact-dialog'

type ContactDialogValue = {
  open: () => void
}

const ContactDialogContext = createContext<ContactDialogValue | null>(null)

export function useContactDialog(): ContactDialogValue {
  const value = useContext(ContactDialogContext)
  if (!value) {
    throw new Error('ContactTrigger must be rendered inside ContactDialogProvider')
  }
  return value
}

/**
 * Holds the open state and mounts exactly one dialog, no matter how many
 * triggers the page has. Two triggers with two dialogs would duplicate the
 * whole form in the DOM and leave two independent copies of its state.
 *
 * Wraps `{children}` in the layout, which keeps the page tree server-rendered:
 * a client provider can have server children.
 */
export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const value = useMemo(() => ({ open }), [open])

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      <ContactDialog open={isOpen} onOpenChange={setIsOpen} />
    </ContactDialogContext.Provider>
  )
}
```

- [ ] **Step 5: Write the trigger**

Create `components/contact-trigger.tsx`:

```tsx
'use client'

import type { ReactNode } from 'react'
import { useContactDialog } from '@/components/contact-dialog-provider'

/**
 * A button, not a link: it opens a dialog rather than navigating anywhere.
 * Styling comes from the caller so the hero's outlined pill and the CTA
 * section's solid block can share one behaviour.
 */
export function ContactTrigger({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const { open } = useContactDialog()

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
```

- [ ] **Step 6: Write the dialog**

Create `components/contact-dialog.tsx`:

```tsx
'use client'

import { useEffect, useId, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowRight, Loader2, X } from 'lucide-react'
import {
  contactCloseLabel,
  contactDescription,
  contactEmailQuestion,
  contactErrorMessage,
  contactMessageQuestion,
  contactNameQuestion,
  contactSubmitLabel,
  contactSubmittingLabel,
  contactSuccessBody,
  contactSuccessTitle,
  contactTitle,
} from '@/lib/contact'
import { submitContact } from '@/lib/contact-submit'
import { isValid, validateContact } from '@/lib/validate-contact'
import type { ContactErrors, ContactValues } from '@/lib/validate-contact'
import { NornBadge } from '@/components/ui/norn-badge'
import { NornMark } from '@/components/ui/norn-mark'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY: ContactValues = { name: '', email: '', message: '' }

const fieldClass =
  'contact-field w-full rounded-2xl border border-alabaster/15 bg-alabaster/5 px-4 py-3 font-body text-sm text-alabaster placeholder:text-platinum-gray/50 transition-colors duration-instant focus-ring focus:border-lime/60 motion-reduce:transition-none'

export function ContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()

  const [values, setValues] = useState<ContactValues>(EMPTY)
  const [botcheck, setBotcheck] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (open) return
    // Reset on close rather than on open, so the exit transition plays against
    // the content the visitor was looking at instead of a form blanking mid-fade.
    const timeoutId = setTimeout(() => {
      setValues(EMPTY)
      setBotcheck('')
      setErrors({})
      setStatus('idle')
    }, 200)
    return () => clearTimeout(timeoutId)
  }, [open])

  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (!isValid(nextErrors)) return

    setStatus('submitting')
    const result = await submitContact({ ...values, botcheck })
    setStatus(result.ok ? 'success' : 'error')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-carbon-black/80 backdrop-blur-sm transition-opacity duration-fast data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[90svh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-3xl border border-alabaster/10 bg-carbon-black p-6 transition-[opacity,transform,scale] duration-base ease-out-expo data-[ending-style]:opacity-0 data-[ending-style]:duration-fast data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] md:p-8 motion-reduce:transition-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <NornBadge className="rounded-xl" />
              <Dialog.Title className="font-heading text-2xl font-black text-alabaster">
                {contactTitle}
              </Dialog.Title>
            </div>
            <Dialog.Close
              aria-label={contactCloseLabel}
              className="focus-ring rounded-lg p-1 text-platinum-gray transition-colors duration-instant hover:text-alabaster motion-reduce:transition-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <NornMark className="w-12 animate-in fade-in zoom-in-95 text-lime duration-slow ease-spring" />
              <p className="font-heading text-xl font-black text-alabaster">
                {contactSuccessTitle}
              </p>
              <p className="max-w-xs font-body text-sm text-platinum-gray">
                {contactSuccessBody}
              </p>
            </div>
          ) : (
            <>
              <Dialog.Description className="font-body text-sm text-platinum-gray">
                {contactDescription}
              </Dialog.Description>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {/* The honeypot. Off-screen rather than display:none, because
                    some bots skip fields that are not rendered at all. */}
                <input
                  type="text"
                  name="botcheck"
                  value={botcheck}
                  onChange={(event) => setBotcheck(event.target.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <Field
                  id={nameId}
                  label={contactNameQuestion}
                  error={errors.name}
                  delayMs={0}
                >
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => update('name', event.target.value)}
                    className={fieldClass}
                  />
                </Field>

                <Field
                  id={emailId}
                  label={contactEmailQuestion}
                  error={errors.email}
                  delayMs={90}
                >
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => update('email', event.target.value)}
                    className={fieldClass}
                  />
                </Field>

                <Field
                  id={messageId}
                  label={contactMessageQuestion}
                  error={errors.message}
                  delayMs={180}
                >
                  <textarea
                    id={messageId}
                    name="message"
                    rows={4}
                    value={values.message}
                    onChange={(event) => update('message', event.target.value)}
                    className={`${fieldClass} resize-none`}
                  />
                </Field>

                {status === 'error' && (
                  <p
                    role="alert"
                    className="font-body text-sm text-lime animate-in fade-in duration-fast"
                  >
                    {contactErrorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="focus-ring group mt-1 flex items-center justify-center gap-3 rounded-2xl bg-lime px-8 py-4 font-heading text-lg font-black text-carbon-black transition-[opacity,background-color] duration-instant hover:bg-lime/90 disabled:opacity-70 motion-reduce:transition-none"
                >
                  {status === 'submitting' ? (
                    <>
                      {contactSubmittingLabel}
                      <Loader2
                        className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      {contactSubmitLabel}
                      <ArrowRight
                        className="h-5 w-5 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Module scope, not nested inside ContactDialog: react-hooks/static-components
// is error-level in this repo.
function Field({
  id,
  label,
  error,
  delayMs,
  children,
}: {
  id: string
  label: string
  error?: string
  delayMs: number
  children: ReactNode
}) {
  return (
    <div
      className="contact-field flex flex-col gap-2"
      style={{ '--field-delay': `${delayMs}ms` } as CSSProperties}
    >
      {/* The question is the label. It reads as a chat line and still wires up
          to the input, so the conversational framing costs no accessibility. */}
      <label
        htmlFor={id}
        className="w-fit rounded-2xl rounded-bl-sm bg-alabaster/10 px-4 py-2.5 font-body text-sm text-alabaster"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-lime animate-in fade-in duration-fast">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Add the field stagger to `app/globals.css`**

Append:

```css
/* Contact dialog field stagger ---------------------------------------------
   Driven entirely by the attribute Base UI puts on the popup while it opens,
   so there is no JS timing to keep in sync with the CSS. */
.contact-field {
  transition:
    opacity 320ms var(--ease-out-expo),
    transform 320ms var(--ease-out-expo);
  transition-delay: var(--field-delay, 0ms);
}

[data-starting-style] .contact-field {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .contact-field {
    transition: none;
  }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run components/contact-dialog.test.tsx`
Expected: PASS, 8 tests.

- [ ] **Step 9: Commit**

```bash
git add components/contact-dialog.tsx components/contact-dialog-provider.tsx components/contact-trigger.tsx components/contact-dialog.test.tsx app/globals.css package.json package-lock.json
git commit -m "feat: add the conversational contact dialog"
```

---

### Task 14: Wire the triggers into the page

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/hero-section.tsx`
- Modify: `components/cta-section.tsx`
- Modify: `lib/cta.ts`
- Modify: `components/hero-section.test.tsx`
- Modify: `components/cta-section.test.tsx`

- [ ] **Step 1: Update the tests first**

In `components/hero-section.test.tsx`, wrap every `render(<HeroSection />)` in
the provider. Add the import and a helper:

```tsx
import { ContactDialogProvider } from './contact-dialog-provider'

function renderHero() {
  return render(
    <ContactDialogProvider>
      <HeroSection />
    </ContactDialogProvider>
  )
}
```

Replace each `render(<HeroSection />)` call with `renderHero()`, and change the
CTA assertion from a link to a button:

```tsx
    expect(
      screen.getByRole('button', { name: /Iniciar Projeto/i })
    ).toBeInTheDocument()
```

In `components/cta-section.test.tsx`, do the same: wrap renders in the
provider, drop the `ctaHref` import, and replace the "renders the call to
action as a link" test with:

```tsx
  it('opens the contact dialog rather than navigating', () => {
    renderCta()

    // It opens a dialog, so it is a button. A link here would promise a
    // destination that does not exist.
    expect(
      screen.getByRole('button', { name: new RegExp(ctaLabel) })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: new RegExp(ctaLabel) })).toBeNull()
  })
```

Note the "renders the logo mark" test in `hero-section.test.tsx` uses
`getByTestId('norn-mark')`, which will now find more than one element once the
dialog mounts its badge. Change it to `getAllByTestId('norn-mark')` and assert
`.length` is at least 1.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run components/hero-section.test.tsx components/cta-section.test.tsx`
Expected: FAIL — no button named "Iniciar Projeto" exists yet.

- [ ] **Step 3: Mount the provider in the layout**

In `app/layout.tsx`, add the import and wrap the children:

```tsx
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
```

```tsx
      <body className="font-body antialiased">
        <ContactDialogProvider>{children}</ContactDialogProvider>
      </body>
```

- [ ] **Step 4: Replace the hero CTA**

In `components/hero-section.tsx`, add the imports:

```tsx
import { ContactTrigger } from '@/components/contact-trigger'
import { ctaLabel } from '@/lib/cta'
```

and replace the "Iniciar Projeto" anchor with:

```tsx
            <ContactTrigger className="focus-ring group flex items-center gap-2 rounded-full border border-lime px-6 py-3 font-body text-sm font-medium text-lime transition-colors duration-instant hover:bg-lime hover:text-carbon-black motion-reduce:transition-none">
              {ctaLabel}
              <span
                aria-hidden="true"
                className="transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </ContactTrigger>
```

- [ ] **Step 5: Replace the CTA section button**

In `components/cta-section.tsx`, drop the `ctaHref` import, add the
`ContactTrigger` import, and replace the anchor with:

```tsx
        <ContactTrigger className="focus-ring group mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-carbon-black px-8 py-4 font-heading text-lg font-black text-alabaster transition-colors duration-instant hover:bg-carbon-black/90 md:w-auto">
          {ctaLabel}
          <ArrowRight
            className="h-5 w-5 shrink-0 text-lime transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </ContactTrigger>
```

- [ ] **Step 6: Delete the dead href**

In `lib/cta.ts`, delete the `ctaHref` export and its TODO comment block
entirely. The destination it was waiting for now exists.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS, every file.

- [ ] **Step 8: Commit**

```bash
git add app/layout.tsx components/hero-section.tsx components/cta-section.tsx lib/cta.ts components/hero-section.test.tsx components/cta-section.test.tsx
git commit -m "feat: open the contact dialog from both Iniciar Projeto buttons"
```

---

### Task 15: Full verification

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors. Watch for `react-hooks/set-state-in-effect` and
`react/no-unescaped-entities` — both are error-level in this repo, which is
why all copy lives in `.ts` modules.

- [ ] **Step 2: Test**

Run: `npm test`
Expected: all files pass.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: static export succeeds.

- [ ] **Step 4: Confirm the motion utilities actually shipped**

Run: `grep -rlo "focus-ring\|duration-base\|ease-out-expo" out/_next/static/chunks/*.css`
Expected: at least one file matches. An empty result means the `@utility`
declarations did not compile into real classes and every `focus-ring` on the
page is inert.

- [ ] **Step 5: Send a real submission**

Run: `npm run dev`, open http://localhost:3000, click "Iniciar Projeto", fill
in a real name, a real address and a message, and submit.
Expected: the success panel appears, and an email arrives at
`rodrigogrowthdesign@gmail.com` with subject `Novo projeto — <name>`. Hit Reply
in Gmail and confirm the To: field is the address that was typed, not
Web3Forms.

**If nothing arrives:** the Web3Forms account must have confirmed the
destination address. Check that `rodrigogrowthdesign@gmail.com` completed the
confirmation email Web3Forms sends on signup, and check the spam folder.

- [ ] **Step 6: Check the keyboard path**

With the browser focused on the page, press Tab repeatedly from the top.
Expected: a visible lime ring on every control — both hero CTAs, the footer
links, and, once the dialog is open, all three fields, the submit button and
the close button. Focus must stay inside the dialog while it is open, and
return to the trigger when it closes.

- [ ] **Step 7: Check reduced motion end to end**

Set the OS to "reduce motion" (macOS: System Settings → Accessibility →
Display → Reduce motion), then reload.
Expected: no WebGL fluid — a static lime wash instead; every section present
immediately with no reveal; the chat conversation fully visible with no typing
sequence; anchor links jump rather than glide; the dialog appears without
transition. Nothing is invisible or unreachable.

- [ ] **Step 8: Commit any fixes**

```bash
git add -A
git commit -m "fix: verification pass on the contact dialog and motion work"
```

---

## Notes for the implementer

**The one non-obvious constraint.** `next.config.ts` sets `output: "export"`.
There is no server, no API route, and no server action. Anything that needs a
backend has to go to a third-party endpoint from the browser.

**Why the gate is a `<head>` script and not a hook.** Any React-driven approach
paints the content first and hides it afterwards, because state settles after
hydration and hydration is after first paint. That is the exact bug the chat
section shipped with. The script is the only place that runs early enough.

**Why `Reveal` wraps groups, not cards.** `SpotlightGroup` measures its cards
with `offsetLeft`/`offsetTop`. A wrapper per card is an extra element between
the card and the group, and while it does not change `offsetParent`, the
transform during the reveal means the measured offsets briefly disagree with
where the card is actually painted. Wrapping the whole group avoids it.

**Copy goes in `.ts` modules, never in JSX.** `react/no-unescaped-entities` is
error-level here and rejects apostrophes and quotes in JSX text. Every existing
copy module says so at the top.

**One deliberate deviation from the spec.** The spec said `lib/motion.ts` would
mirror the duration scale into JS "so the two never drift". It does not, and
should not: Base UI drives every dialog transition from CSS via
`data-starting-style`, and the reveal transitions are CSS too, so a JS-side
`DURATION` map would have no consumer. The module carries only what is genuinely
shared between JS and CSS — the gate class name, the stagger beat and the
observer margin. The chat's own pacing constants (`TYPING_MS`, `CLIENT_BEAT_MS`,
`CATCHUP_MS`) stay in `chat-conversation.tsx` on purpose: 650ms of "typing" is
conversational rhythm, not a transition duration, and folding it into the scale
would be a false consolidation.
