# NornStudio: "Nossos serviços" section

## Context

Third scroll of the homepage, after `HeroSection`, `WhatWeDoSection` and
`ChatFlowSection`. A supplied mobile reference shows four numbered service
cards under a bracket eyebrow and a headline.

A `GlowCard` component (the shadcn `spotlight-card` registry entry) was supplied
as the effect reference, with the requirement that it use brand colours.

## Goal

Build `ServicesSection` and render it after `ChatFlowSection`, with a spotlight
that tracks the pointer across the card group in lime.

## Decisions

**Brand colour instead of the supplied hue math**

The original derives a hue from the pointer's X position
(`--hue: calc(var(--base) + (var(--xp) * var(--spread)))`), sweeping through a
rainbow as the cursor moves. That exists to make a demo colourful and is wrong
here: the brand is one fixed hue. The hue machinery is dropped entirely and the
gradients reference `var(--color-lime)` directly.

`--color-lime` is available at runtime: despite `@theme inline`, Tailwind still
emits it into `:root, :host` under `@layer theme` (verified in the compiled
CSS). Lightning CSS additionally emits a static `#c6f43224` fallback plus an
`@supports (color: color-mix(...))` upgrade, so the surface glow degrades
cleanly on browsers without `color-mix`.

**One shared light source, not four independent glows**

The original attaches a `pointermove` listener inside every card and writes four
CSS properties per card per event. With four cards that is sixteen style writes
on every pointer move, plus four copies of the same `<style>` tag injected via
`dangerouslySetInnerHTML`.

Here `SpotlightGroup` owns a single driver. It keeps one light position in the
group's coordinate space and writes it to each card already translated into that
card's own box, as `--spot-x` / `--spot-y`. One light, four windows onto it, so
it reads as a single source passing over the group rather than four separate
glows. Work is coalesced into `requestAnimationFrame`, so a burst of pointer
events costs one write per card per paint rather than one per event, and the
group's rect is read once per frame rather than once per card.

**Auto mode on touch (revised after production feedback)**

There is no cursor on a phone, so the first version gated the whole effect
behind `(hover: hover) and (pointer: fine)` and left touch devices with a plain
card. That reads as dead. `SpotlightGroup` now mirrors the hero: `isTouchDevice()`
switches it to an auto driver, the same fallback `LiquidEther` uses for its
`autoDemo`, and an `IntersectionObserver` parks the loop whenever the section is
off screen, exactly as `LiquidEther` parks its render loop.

The auto path sweeps horizontally across the group while its vertical position
is anchored to the middle of the viewport, so the light stays on whichever card
is actually being read, with a slow drift so it never sits perfectly still.

Auto mode is suppressed under `prefers-reduced-motion`. The pointer-driven path
is not: that one is direct manipulation, like a hover state, and suppressing it
would remove feedback rather than remove motion.

**Shared with `WhatWeDoSection`**

The spotlight was later applied to the three cards in `WhatWeDoSection` as well,
which is why `SpotlightGroup` / `SpotlightCard` live under `components/ui/`
rather than beside this section.

Each section owns its own group, and that is deliberate: a group's light is one
position in *its* coordinate space, so a single group spanning both sections
would put the light in the gap between them for most of the page. Two groups
also means two drivers, but each auto loop is parked by its own
`IntersectionObserver` when its section is off screen, and the two sections are
far enough apart that only one runs at a time.

**Card-local coordinates, not `background-attachment: fixed`**

Sharing one viewport coordinate space via `background-attachment: fixed` is the
cheaper trick and is what the original does, but Safari on iOS does not honour
fixed attachment — it paints those gradients as if they scrolled. That would
misplace the highlight on exactly the devices auto mode exists for. The driver
therefore does the translation in JS and each card positions its gradient in its
own box, which behaves identically everywhere.

Card offsets are read relative to the group (which is `position: relative`), so
unlike viewport rects they only change on layout and are re-measured on resize
rather than every frame.

**CSS lives in `globals.css`, not in the component**

The pseudo-elements cannot be expressed as Tailwind utilities, but injecting
them through `dangerouslySetInnerHTML` per card duplicates the rules and adds an
unsanitised HTML sink for no reason. They are plain CSS rules in `globals.css`
instead. Only effect-specific properties are set there (`background-image`,
`background-attachment`, `background-repeat`, `position`), so unlayered CSS
never fights the Tailwind utilities that handle colour, spacing and radius on
the same element.

**The rim**

`.spotlight-card::before` spans the card's border box exactly (`inset: -1px`
against the padding box, matching the card's 1px border), then
`mask-clip: content-box, border-box` with `mask-composite: exclude` subtracts
the content box so only the 1px ring survives. This is the standard
gradient-border technique; Lightning CSS emits the `-webkit-mask-composite: xor`
fallback automatically.

The supplied component's mask used `mask-composite: intersect` with a fully
transparent first layer, which multiplies to zero alpha. `exclude` with a
content-box layer is the form that actually yields a ring.

The card keeps a faint `border-alabaster/10` underneath, so it reads as a
normal card until the spotlight passes over it.

**Styling**
- Existing tokens only. Section shell, eyebrow and heading scale match
  `ChatFlowSection` exactly.
- Cards reuse the established surface: `rounded-2xl border border-alabaster/10
  bg-alabaster/5 p-6`, plus `border-l-alabaster/25` for the brighter left edge
  visible on every card in the reference.
- Number and title share one `<h3>` so the heading's accessible name carries
  both; they are separate spans for baseline alignment.

**Responsive**
- Single column on mobile per the reference, `md:grid-cols-2` above it,
  matching `WhatWeDoSection`.

**Copy corrections**
The reference contains `Nossos serviço` (singular) and `O importante é comece
agora`. Corrected to `Nossos serviços` and `O importante é começar agora`.

**Testing**
- `spotlight-card.test.tsx` covers both drivers: with a pointer, that the light
  lands in card-local coordinates and that a burst of moves coalesces into one
  frame; on touch, that the group drives the light itself once on screen, stays
  idle until it scrolls into view, stops when it scrolls away, ignores the
  pointer, and holds still under reduced motion.
- jsdom in the Vitest environment provides `PointerEvent` and
  `requestAnimationFrame`; `vi.advanceTimersToNextFrame()` drives both paths.
  The matchMedia stub answers per query string, since `isTouchDevice` and
  `prefersReducedMotion` both read it and the tests need them to disagree.
- Verified the auto-mode tests fail when the loop is deliberately not started.
- The visual result itself is not covered — it is pure CSS painting.

## Out of scope

- Scroll-reveal on the service cards. The section is static apart from the
  spotlight.
- Links or CTAs on the cards; the reference shows none.
