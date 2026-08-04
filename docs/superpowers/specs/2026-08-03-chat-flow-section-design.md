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

**Ordering: one conversation-wide cursor (revised after production feedback)**

The first implementation gave every row its own observer and its own timers.
That reads correctly in isolation but breaks the conversation: a Norn bubble
pauses 700ms to "type" while the client message after it resolves in 0ms, so
message 3 lands before message 2. It showed up on mobile first, where a short
viewport pushes several rows across the trigger at once. It affected
`descobrir` and `entregar`, both of which run `client → norn → client`.

`ChatConversation` now owns a single monotonic cursor:
- Scroll only decides *how far* the cursor may run (`maxEntered`); the cursor
  alone decides *what resolves next*, always one message at a time, in order.
- Pacing lives on the cursor: `TYPING_MS` before a Norn bubble,
  `CLIENT_BEAT_MS` before a client one. Rows hold no timers at all.
- Once the visitor is `CATCHUP_BACKLOG` messages ahead, pacing drops to
  `CATCHUP_MS` and typing dots are suppressed. Dots are for pacing, not for
  making someone who already scrolled past wait.
- The drain effect depends on a `canAdvance` **boolean**, not on `maxEntered`.
  Depending on the number would clear and reschedule the timer on every row
  that enters during a fast scroll, and the cursor would never advance.

**Bottom anchoring**

`ENTER_ROOT_MARGIN = '0px 0px -10% 0px'` puts the trigger just inside the lower
edge of the viewport, so a message resolves as it rises into view rather than
while it is still off-screen. Rows the visitor has already scrolled past never
report as intersecting, so the observer also checks
`boundingClientRect.top < rootBounds.bottom` directly — without that, a restored
scroll position strands the cursor behind them.

**Reveal state machine (`ChatMessageRow`, driven by the cursor)**

A row derives its phase from the cursor; it owns no reveal state of its own.

    not armed          → 'initial'  bubble visible, no animation classes.
                                    What the server renders, so hydration
                                    matches and the copy is always in the
                                    static HTML.
    index <  cursor    → 'shown'    text visible
    index == typing    → 'typing'   dots over the text, which stays mounted
                                    under `invisible` to hold the row height
    otherwise          → 'hidden'   opacity-0

`ChatConversation` arms once, in a `setTimeout(..., 0)` — the repo's existing
workaround for `react-hooks/set-state-in-effect` (`live-clock.tsx`,
`liquid-ether-background.tsx`). The rule does not inspect nested callbacks, so
`setState` inside that timer and inside the observer callback both pass. The
reduced-motion / no-observer bail-out happens *before* arming, so those
environments never schedule an update and never construct an observer at all.

`'typing'` and `'shown'` share one animation class string, so the bubble
animates in once and does not restart when the text replaces the dots. The
observed ref is the stable outer row wrapper, never the bubble, whose subtree
is swapped during `'typing'`.

Observer options are `{ threshold: 0, rootMargin: ENTER_ROOT_MARGIN }`. A
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
- The eyebrow uses lime bracket corners, per the reference. This was the first
  section to use them; `WhatWeDoSection` kept its older bordered pill for a
  while, and every section now shares `components/ui/section-eyebrow.tsx`.

**The phase rail (added later)**

The section read as unfinished next to the rest of the page, but the cause was
not missing glow — it was structural. The container is `max-w-5xl` (1024px) and
the thread is `max-w-2xl` (672px) centred, so wide screens leave ~176px of dead
gutter each side under a left-aligned header. A background wash would have lit
those pixels without composing them.

`ChatPhaseRail` occupies the left gutter with a vertical progress bar, one equal
segment per phase, driven by the reveal cursor the section already owns. It
carries only the numbers `01`–`04`; the phase names stay in the thread's `<h3>`
dividers, so nothing is duplicated and the rail is `aria-hidden`.

Decisions that are load-bearing:

- **`lg`, not `md`.** At a 768px viewport the container is 672px and the thread
  is 672px — the gutter is exactly zero and the rail would sit on top of the
  thread. `lg` gives 128px, ≥1120px gives 176px.
- **Progress is normalised per phase**, in `lib/chat-rail-progress.ts`. The
  phases hold 4, 3, 1 and 4 messages across four *equal* segments, so a raw
  `revealedCount / total` puts the bar at 33% when phase 01 completes while its
  node sits at 25%. The bar would cross the nodes at the wrong moment.
- **Unarmed means complete, not empty.** With reduced motion, without
  `IntersectionObserver`, or in the prerendered HTML, every message is already
  visible — so the rail renders full and every node reached. Gating on
  `revealedCount` alone would grey out three phases forever in the static export.
- **The fill is remounted on `key={armed ? 'armed' : 'idle'}`.** Arming flips the
  cursor from "all visible" to zero in a separate task from hydration, and
  without the remount the browser animates a 700ms drain from full to empty on
  page load.
- **Phase counts arrive as props.** `lib/chat-flow-script.ts` is in zero client
  bundles — the section is a server component and the other consumers use
  `import type`. Importing `chatPhases` inside the client rail would ship all
  twelve messages of copy to the browser to duplicate the exported HTML. There
  is a verification step that greps the built chunks for chat copy.

`ChatPhaseDivider` gives the same progress cue at every width: the phase label
dims to `text-platinum-gray` until its phase is reached. That is what mobile
gets, since the gutter the rail fills does not exist there.

**Responsive**
- Chat is a `max-w-2xl` column centred inside the `max-w-5xl` container;
  bubbles cap at `max-w-[80%]`. A chat reads better narrow, so desktop gains
  centring rather than a second column.

**Pacing**
- The cursor's own delays are the stagger. There is no per-row
  `animationDelay`; an earlier version had one and it only added lag on top of
  a sequence that is already serialised.
- The typing dots do still need an inline `animationDelay`. `delay-*` cannot be
  used anywhere here: Tailwind core's `delay-*` shadows tw-animate-css's and
  emits `transition-delay`, not `animation-delay`.
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
- `chat-conversation.test.tsx` stubs `IntersectionObserver` via `vi.stubGlobal`,
  captures each row's callback, and drives the cursor with synchronous `act()`
  plus fake timers. It asserts on a `data-phase` attribute rather than Tailwind
  class strings, which will keep changing during visual polish.
- Its central assertion is an invariant, not a snapshot: resolved messages must
  always form a contiguous prefix. That is what the production bug violated,
  and it holds regardless of how the timings are later tuned.
- Each cursor step schedules the next from a commit-time effect, so tests must
  advance the clock one step per `act()`. One large `advanceTimersByTime` only
  fires the first timer.
- jsdom has no `IntersectionObserver`, so in `chat-flow-section.test.tsx` every
  row stays at `'initial'` and content assertions are plain synchronous
  `getByText`, matching the `what-we-do-section.test.tsx` archetype.

## Out of scope

- Unifying the bracket eyebrow with `WhatWeDoSection`'s pill eyebrow.
- Real avatar or logo image assets.
- Any interactive chat input; the conversation is a fixed narrative.
