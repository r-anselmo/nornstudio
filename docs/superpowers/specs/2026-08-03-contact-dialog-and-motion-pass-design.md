# Contact dialog and site-wide motion pass

Date: 2026-08-03

## Problem

Two things are wrong with the site as it stands.

**The CTAs go nowhere.** `ctaHref` in `lib/cta.ts` is `'#'` and carries a TODO
saying as much. The hero's "Iniciar Projeto" scrolls to `#contato`, where the
button below it does nothing. A visitor who wants to hire Norn has no way to
say so.

**Motion is concentrated in one section.** The chat flow has a carefully built
reveal cursor, a progress rail and a spotlight that tracks the pointer. The
hero, WhatWeDo, Services, CTA and footer have no entrance choreography at all,
no hover states on most controls, and no focus styles anywhere on the site.
The result reads as two different sites stitched together, and it is unusable
by keyboard.

## Constraints

`next.config.ts` sets `output: "export"`. This is a static site deployed to
GitHub Pages. There is no server and there are no route handlers, so form
submission must go to a third-party endpoint that accepts a browser `POST`.

## Decisions taken

- **Delivery:** Web3Forms, access key `4d062bc0-bcbe-4889-87f7-a3bc1cb2b2b1`,
  delivering to `rodrigogrowthdesign@gmail.com`.
- **Pattern:** a conversational modal, borrowing the chat section's language.
- **Fields:** nome, e-mail, problema. E-mail is required — without it a
  submission is a problem statement with no way to answer it.
- **Pacing:** fields stagger in on open but are all editable immediately. No
  typeform-style gating.
- **Scope:** the full motion pass, not just the accessibility fixes.

### The access key is public, deliberately

Web3Forms access keys are client-side keys. On a static export there is nowhere
to hide one — `NEXT_PUBLIC_*` values are inlined into the bundle at build time,
so an env var would offer privacy theatre rather than privacy. The key is
therefore a plain constant in `lib/contact.ts`, with the reasoning recorded
beside it.

The practical exposure is inbox spam, not account compromise. Mitigations: the
Web3Forms honeypot field, their own spam filtering, and key rotation from their
dashboard if it is ever abused.

## Architecture

### Motion tokens — `app/globals.css`

Durations and easings are currently scattered literals: `duration-500`,
`duration-700`, `TYPING_MS = 650`, `CLIENT_BEAT_MS = 220`, `CATCHUP_MS = 70`,
LiquidEther's `takeoverDuration: 0.25`. `ease-out` appears exactly once; every
other transition falls back to the browser default.

A named scale replaces them:

| Token | Value | Used for |
|---|---|---|
| `instant` | 120ms | colour-only state changes |
| `fast` | 200ms | hover, dialog exit |
| `base` | 320ms | dialog enter, reveals |
| `slow` | 520ms | message rows, rail nodes, dividers |
| `deliberate` | 700ms | rail fill |

Curves, in `@theme` under Tailwind's `--ease-*` namespace so they generate
utilities:

- `--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94)` — UI state changes.
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — entrances. The steep
  deceleration is what makes an element read as *arriving* rather than sliding.
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — the success
  confirmation, and nothing else. Overshoot loses its meaning if it is
  everywhere.

Tailwind 4.3.3 has no `--duration-*` theme namespace (only
`--default-transition-duration`), so durations become `@utility` rules —
`duration-fast`, `duration-base` and so on — giving named classes rather than
numbers. JS-side timings read the same scale from a `lib/motion.ts` constant
module so the two never drift.

### The `js-motion` gate

Both the existing chat flash and any new scroll reveal are the same bug: an
element must be visible in the server HTML (for no-JS, for reduced motion, for
crawlers) but hidden on the client's first frame. React state cannot do this —
it settles after hydration, which is after first paint. `ChatConversation`
currently flips `armed` in a `setTimeout(0)`, so all twelve messages paint
fully visible and then blank.

A blocking script in `<head>` resolves it before first paint:

```js
if (!matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window)
  document.documentElement.classList.add('js-motion')
```

The hidden-initial state then lives in CSS gated on `.js-motion`. The class
means exactly "reveal animations will run", matching the conditions the JS
guards already check, so an element can never be left permanently invisible by
a browser that cannot advance it.

This is the mechanism for both the `Reveal` primitive and the chat rows.

### `components/ui/reveal.tsx`

The entrance logic is currently trapped inside `ChatMessageRow`. `Reveal`
extracts it: a client component that fades and rises 12px when it enters the
viewport, one-shot, disconnecting its observer on trigger.

```
<Reveal delay={90}>…</Reveal>
```

Applied with stagger to the hero (headline lines, then subtext, then CTAs),
the WhatWeDo cards, the Services cards, the CTA block and the footer.

The chat section keeps its own cursor. `Reveal` is for static content
appearing; `ChatConversation` sequences a conversation, which is a different
problem, and collapsing them would lose the ordering guarantee its comments
describe.

### Interaction states

The site has no `focus-visible` styling at all, and the inherited
`--ring: oklch(0.708 0 0)` is a mid-grey — invisible against `carbon-black`.
Keyboard navigation is currently impossible to follow. This is the most severe
finding in the review and is fixed first.

An `@utility focus-ring` (2px lime outline, 2px offset) goes on every
interactive element. Hover states:

- Hero primary CTA: lime outline fills to solid lime with carbon text; arrow
  slides 2px right.
- Hero secondary: underline wipes in from the left.
- Cards (Services, WhatWeDo): 2px lift, border brightens.
- Skill chips and building tags: background brightens.
- CTA button arrow: slides 2px right.

All colour transitions at `instant`, transforms at `fast`, each carrying a
`motion-reduce:` guard.

### Contact dialog

Built on `@base-ui/react/dialog` (already a dependency at 1.6.0), which
supplies focus trap, scroll lock, Escape handling and ARIA wiring. `field` and
`form` parts from the same package handle validation display.

Structure:

- `lib/contact.ts` — copy, the access key, field definitions.
- `lib/validate-contact.ts` — pure validation. Nome non-empty, e-mail shaped
  like an address, problema at least 10 characters. Returns a field-keyed error
  map. No React, no network, directly unit-testable.
- `lib/contact-submit.ts` — `submitContact(values)`, the only place that knows
  about Web3Forms. Returns a discriminated result rather than throwing.
- `components/contact-dialog-provider.tsx` — client. Holds open state and
  mounts exactly one dialog. Wraps `{children}` in `layout.tsx`, which keeps
  the page tree server-rendered.
- `components/contact-trigger.tsx` — client. A button that opens the dialog,
  styled by the caller.
- `components/contact-dialog.tsx` — the panel.

One dialog instance behind a context, rather than one per trigger, so the form
markup is not duplicated in the DOM and there is a single source of state.

Both "Iniciar Projeto" buttons become triggers. The footer's "CONTATO" link
still scrolls to the `#contato` section, which keeps its copy and now hosts a
trigger instead of a dead link.

**Payload:**

```
POST https://api.web3forms.com/submit
  access_key  4d062bc0-bcbe-4889-87f7-a3bc1cb2b2b1
  subject     "Novo projeto — {nome}"
  from_name   "Norn Studio"
  name        {nome}
  email       {email}
  message     {problema}
  replyto     {email}
  botcheck    ""            ← honeypot, must stay empty
```

`replyto` makes Reply in Gmail address the lead directly.

**States:** `idle → submitting → success | error`.

- `submitting` — label crossfades to a spinner, panel disabled.
- `success` — form crossfades to a confirmation carrying the Norn mark, on
  `ease-spring`.
- `error` — everything typed is preserved, with a retry affordance. Network
  failure and a non-OK response produce the same visitor-facing message; the
  distinction does not change what they can do about it.

**Motion:** backdrop fades at `fast`. Panel rises 8px and scales 0.98 → 1 at
`base` on `ease-out-expo`. Fields stagger at 90ms intervals. Exit runs at
`fast` — quicker than entry, because a dismissed thing should get out of the
way. Everything suppressed under reduced motion.

### Remaining review fixes

- **LiquidEther ignores reduced motion.** `LiquidEtherBackground` checks only
  `isTouchDevice()`. A full-screen WebGL fluid animating behind the headline is
  the exact case `prefers-reduced-motion` exists for. It gains a reduced-motion
  branch rendering a static lime radial gradient, so the hero composition
  survives rather than flattening to bare carbon. Resolution happens before
  mount so WebGL is never initialised only to be torn down.
- **Typing dots.** `animate-pulse` is a 2s opacity fade that reads as a loading
  skeleton, and the 0/150/300ms offsets are imperceptible against it. Replaced
  with a 1.4s vertical bounce keyframe registered via `--animate-*`, offsets at
  0/160/320ms.
- **Anchor jumps.** `scroll-behavior: smooth` on `html`, reverted to `auto`
  under reduced motion, plus `scroll-margin-top` on the anchor targets.
- **LiveClock layout shift.** It returns `null` until hydration, so the hero
  header's right side pops in. It renders a `tabular-nums` placeholder of the
  same width instead.
- **Duplicated signature.** `NORNGROWTHDESIGN · SINCE 2026` is hardcoded in
  `what-we-do-section.tsx` and also exported as `footerSignature`. Collapses to
  one constant.

## Testing

Vitest with Testing Library, matching the existing suite.

- `validate-contact` — pure unit tests over the rules and the error map.
- `contact-submit` — mocked `fetch`. Asserts the exact payload including
  `replyto` and the honeypot; covers OK, non-OK and network rejection.
- `contact-dialog` — opens from a trigger, validates before submitting, shows
  the success state, preserves input on error.
- `reveal` — renders children visible without an observer, so the server
  output and the reduced-motion path are both covered.
- Existing suites must keep passing. `hero-section.test.tsx` asserts
  `getByRole('link', { name: /Iniciar Projeto/i })`; the trigger becomes a
  `button`, so that assertion changes with the component.

## Out of scope

- A sticky nav. The footer links imply one, but it is a separate design
  decision.
- A hero scroll cue.
- `transition-all` in `components/ui/button.tsx`. That component is unused on
  this page.
- Replacing LiquidEther, or tuning its fluid parameters.
