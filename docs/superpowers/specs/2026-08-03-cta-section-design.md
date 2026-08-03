# NornStudio: "Vamos começar algo juntos" CTA section

## Context

Fourth and closing scroll of the homepage, after `ServicesSection`. A supplied
mobile reference shows the first inverted surface on the site: lime background,
carbon type, a single dark button, and an oversized brand mark bled off the
bottom-right corner.

## Goal

Build `CtaSection` and render it last on the homepage.

## Decisions

**Inverted palette**

Every section so far sits on `bg-carbon-black`. This one flips to `bg-lime` with
`text-carbon-black`, which is what makes it read as the end of the page rather
than another band of content. No new tokens: the same four brand colours,
swapped.

The bracket eyebrow had to gain a tone for this. In lime it is invisible on a
lime surface.

**Shared eyebrow, extracted**

The bracket eyebrow was copy-pasted in `ChatFlowSection` and `ServicesSection`
and this section would have been the third. It is now
`components/ui/section-eyebrow.tsx` with a `tone` of `lime` (dark sections) or
`carbon` (this one). Class names are full literals per tone; Tailwind's scanner
cannot resolve names built at runtime.

The two existing section tests were the safety net for the extraction — they
assert the rendered eyebrow text and were left untouched, so a green run proves
the refactor changed nothing observable.

**The brand mark**

Still no logo file has ever been supplied, so this is the same placeholder
situation as the text "N" in the hero and the chat avatars, just at display
size. `NornMark` is an inline `<svg>`: a single stroked path (`M19 85V15l62
70V15`) with `stroke-linecap: round`, matching the thick rounded strokes in the
reference. Rotated and bled off the corner at `text-carbon-black/10`, with
`overflow-hidden` on the section to clip it and `pointer-events-none` so it
never intercepts the button.

Inline rather than a file under `public/`: with `output: "export"` and the
GitHub Pages `basePath`, static assets do not receive the prefix automatically,
so an inline path avoids a class of broken-on-deploy bug entirely. Swap the path
data when a real mark arrives.

**The button destination is a placeholder**

There is no contact page, email, booking link or phone number anywhere in the
project, and the destination is a business decision. `ctaHref` is `'#'` with a
TODO, isolated in `lib/cta.ts` so pointing it at the real target is a one-line
change in an obvious place.

**This is deliberately unfinished.** The button renders and looks live but does
nothing. It must not be treated as a working CTA until `ctaHref` is set.

**Styling**
- Section shell matches the others: `px-6 py-16 md:px-12 md:py-24` inside
  `mx-auto max-w-5xl`.
- Heading runs larger than the other sections (`text-3xl md:text-5xl`) since it
  is the closing statement.
- Button is full-width on mobile per the reference, `md:w-auto` above it.
  Carbon surface, alabaster label in `font-heading`, lime arrow (`ArrowRight`
  from lucide, `aria-hidden` — the label already carries the meaning).
- Body copy at `text-carbon-black/80`; carbon on lime is high contrast, so the
  slight mute keeps the heading dominant without hurting legibility.

**Testing**
- `cta-section.test.tsx` covers the copy, that the CTA is a link pointing at
  `ctaHref`, that the palette actually inverted (lime surface, carbon heading
  *and* carbon eyebrow), and that the decorative mark is `aria-hidden` and
  clipped.
- Asserting the eyebrow tone matters: getting it wrong renders lime-on-lime,
  which no content assertion would catch.

## Out of scope

- A real CTA destination, and any form or booking flow behind it.
- A footer. This section closes the page for now.
