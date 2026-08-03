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

Here `SpotlightGroup` owns a single listener and writes `--pointer-x` /
`--pointer-y` once, on itself. Custom properties inherit, so every card reads
them for free. Combined with `background-attachment: fixed`, all cards share one
viewport coordinate space and the highlight reads as a single light passing over
the group rather than four separate glows.

The listener coalesces into `requestAnimationFrame`, so a burst of pointer
events costs one style write per paint rather than one per event.

**CSS lives in `globals.css`, not in the component**

The pseudo-elements cannot be expressed as Tailwind utilities, but injecting
them through `dangerouslySetInnerHTML` per card duplicates the rules and adds an
unsanitised HTML sink for no reason. They are plain CSS rules in `globals.css`
instead. Only effect-specific properties are set there (`background-image`,
`background-attachment`, `background-repeat`, `position`), so unlayered CSS
never fights the Tailwind utilities that handle colour, spacing and radius on
the same element.

**Gated on a fine pointer**

The whole block sits behind `@media (hover: hover) and (pointer: fine)`, and
`SpotlightGroup` skips its listener via the existing `isTouchDevice()` helper.
With no cursor there is nothing to follow, and viewport-fixed gradients would
still cost repaints on every scroll — a real concern on a page that already
ships a WebGL hero. Touch devices get the plain card surface, which is exactly
what the reference mockup shows.

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
- `spotlight-card.test.tsx` asserts the group publishes the pointer position,
  that a burst of moves coalesces into one frame, that touch devices are not
  tracked, and that the listener detaches on unmount. jsdom in the Vitest
  environment provides both `PointerEvent` and `requestAnimationFrame`;
  `vi.advanceTimersToNextFrame()` drives the coalescing.
- The visual effect itself is not covered by tests — it is pure CSS painting.

## Out of scope

- Scroll-reveal on the service cards. The section is static apart from the
  spotlight.
- Links or CTAs on the cards; the reference shows none.
