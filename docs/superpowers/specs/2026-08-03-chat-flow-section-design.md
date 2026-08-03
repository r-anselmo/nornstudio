# NornStudio: "Como fazemos" chat flow section

## Context

The homepage has `HeroSection` and `WhatWeDoSection`. The next section a
visitor reaches explains *how* the studio works. A supplied mobile reference
screenshot shows it as a real conversation between a client and Norn, split
into four phases (`01 · DESCOBRIR` → `04 · ENTREGAR`), with chat bubbles,
file attachments, a reaction pill, and a trailing typing indicator.

A `ChatMessages` component built on `framer-motion` was supplied as an
animation reference, with the instruction to adapt the UI rather than copy it.

## Goal

Build `ChatFlowSection` and render it after `WhatWeDoSection`, matching the
reference on mobile, with a proposed treatment for `md`+ screens, and animate
the conversation as the visitor scrolls.

## Decisions

**Playback: scroll-triggered reveal, not autoplay**
- The reference is a long section (four phases, twelve messages), not the
  fixed-height auto-scrolling window the supplied component implements. A
  timed autoplay would animate messages while they are off-screen and force
  the visitor to wait at the animation's pace.
- Each row reveals when it enters the viewport. The visitor controls the pace.

**Animation: CSS only, no new dependency**
- `tw-animate-css` 1.4.0 is already imported in `app/globals.css` and was
  entirely unused. Its `animate-in` / `fade-in` / `slide-in-from-*` /
  `fill-mode-both` utilities cover the whole effect.
- `framer-motion` was rejected: ~35KB gz on top of the `three` bundle the hero
  already ships, for a stagger and three pulsing dots.
- `fill-mode-both` makes the element hold the animation's first keyframe during
  its delay, so there is no pre-delay flash.

**Avatars: no new image assets**
- The repo has no logo or avatar files, and `next.config.ts` uses
  `output: "export"` with a GitHub Pages `basePath`, so files under `public/`
  do not get the prefix automatically. Both avatars are markup:
  client = `lucide-react` `User` in a `bg-alabaster/10` rounded square,
  Norn = the `bg-lime` "N" block already used in the hero.

**Copy lives in `lib/chat-flow-script.ts`, not in JSX**
- `react/no-unescaped-entities` is error-level in this ESLint config and
  rejects apostrophes and quotes in JSX text. The rule only inspects JSX
  children, so string literals in a `.ts` module are immune. This is structural,
  not stylistic: no conversation copy may be inlined into JSX.
- `ChatAttachment.kind` is a string discriminator, not a `LucideIcon`.
  `lucide-react` 1.28 ships no `'use client'` directive, so passing an icon
  reference as a prop into a client component fails the build with
  "Functions cannot be passed directly to Client Components". The icon is
  resolved from `kind` inside the server component.

**Reveal state machine (`ChatMessageRow`)**

    'initial' → server render and first client render: bubble visible, no
                animation classes. Hydration matches and the copy is always
                in the static HTML.
       ↓ useEffect → setTimeout(..., 0)
       ├─ prefersReducedMotion() or no IntersectionObserver
       │    → return before any setPhase; the row stays visible forever
       └─ else → setPhase('hidden') [opacity-0], then attach the observer
            ↓ on intersect (one-shot; observer disconnects)
            ├─ client → 'shown'
            └─ norn   → 'typing' (dots) --700ms--> 'shown'

Three points are correctness requirements, not style:
1. The reduced-motion / no-observer bail-out happens *before* any `setPhase`,
   so those environments never schedule an update at all.
2. The observer is constructed inside the same `setTimeout`, *after*
   `setPhase('hidden')`. Attaching it in the effect body lets its first entry
   race ahead of the pending arm and strand the row at `'hidden'` permanently.
3. The observed ref is the stable outer row wrapper, never the bubble — the
   bubble subtree is swapped during `'typing'`.

`setTimeout(..., 0)` is the repo's existing workaround for
`react-hooks/set-state-in-effect` (`live-clock.tsx`,
`liquid-ether-background.tsx`). The rule does not inspect nested callbacks, so
`setPhase` inside the timer and inside the observer callback both pass.

Observer options are `{ threshold: 0, rootMargin: '0px 0px -15% 0px' }`. A
fractional threshold can never fire for a bubble taller than that fraction of
a small viewport.

**Styling**
- Existing tokens only (`lime`, `carbon-black`, `platinum-gray`, `alabaster`).
  No new tokens.
- Section shell matches `WhatWeDoSection`: `bg-carbon-black px-6 py-16
  md:px-12 md:py-24` inside `mx-auto max-w-5xl`.
- Norn bubbles carry `border-r-2 border-r-lime` — the lime arc in the reference
  is the right border following the `rounded-2xl` corner. `border-r-lime` alone
  renders nothing; preflight zeroes `border-width`.
- The eyebrow uses lime bracket corners, per the reference. `WhatWeDoSection`
  uses a bordered pill instead; unifying the two eyebrow styles is a separate
  decision, deliberately out of scope here.

**Responsive**
- Chat is a `max-w-2xl` column centred inside the `max-w-5xl` container;
  bubbles cap at `max-w-[80%]`. A chat reads better narrow, so desktop gains
  centring rather than a second column.

**Stagger**
- `Math.min(indexInPhase, 3) * 80ms`, indexed *within the phase*. Every row
  observes itself, so a global index would leave late messages invisible for
  most of a second after they are already on screen.
- Applied as an inline `animationDelay` style. `delay-*` cannot be used:
  Tailwind core's `delay-*` shadows tw-animate-css's and emits
  `transition-delay`, not `animation-delay`. The same applies to the dots.
- Animation class names are written as full literals per branch. Tailwind's
  scanner cannot resolve `` `slide-in-from-${side}-4` ``.

**Layout shift**
- The `'typing'` state keeps the text mounted under `invisible` with the dots
  absolutely positioned over it, so the row holds its height and nothing below
  jumps when the text lands. The dots wrapper is `aria-hidden`.

**Copy corrections**
The reference screenshot contains typos, fixed here: `burocarica` →
`burocracia`, `onboardng` → `onboarding`, `comercial acha que e preço` →
`é preço`.

**Testing**
- `lib/prefers-reduced-motion.ts` mirrors `is-touch-device.ts`, including the
  `matchMedia` guard. jsdom 30 provides no `window.matchMedia`; without the
  guard every render of the section throws.
- `chat-message-row.test.tsx` stubs `IntersectionObserver` via `vi.stubGlobal`,
  captures the callback, and drives the machine with synchronous `act()` plus
  fake timers. It asserts on a `data-phase` attribute rather than Tailwind
  class strings, which will keep changing during visual polish.
- jsdom has no `IntersectionObserver`, so in `chat-flow-section.test.tsx` every
  row stays at `'initial'` and content assertions are plain synchronous
  `getByText`, matching the `what-we-do-section.test.tsx` archetype.

## Out of scope

- Unifying the bracket eyebrow with `WhatWeDoSection`'s pill eyebrow.
- Real avatar or logo image assets.
- Any interactive chat input; the conversation is a fixed narrative.
