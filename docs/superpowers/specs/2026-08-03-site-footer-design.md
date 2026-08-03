# NornStudio: site footer

## Context

The page ended on the lime CTA. It needed a real footer, back on the dark
surface. No reference mockup was supplied for this one, so the design comes
from what the rest of the page already established.

## Goal

Build `SiteFooter` and render it last, below `CtaSection`.

## Decisions

**No invented links**

There is no social handle, email address or phone number anywhere in the
project. Rather than ship placeholder icons pointing at `#`, the footer carries
only what actually exists: the brand mark, navigation to the page's own
sections, and the legal line. Social links go in when real handles are supplied.

This is the opposite call from the CTA button, and deliberately so: that button
is the section's entire purpose, so a placeholder there is a tracked TODO.
A footer without social icons is simply a footer, not an unfinished one.

**Voice taken from the hero**

The hero already closes with uppercase micro-labels at `tracking-[0.02em]`
(`ATUANDO GLOBALMENTE`, `SEM ESCRITÓRIO, POR OPÇÃO`). The footer reuses that
register for its nav and legal lines, and opens with the same lime "N" badge
over a hairline rule that the hero header opens with — the page closes on the
mark it opened on.

The tagline is new copy rather than a reprint of the hero headline or the
manifesto line, both of which are already on the page.

**Nav, and a third anchor**

`#servicos` and `#contato` gained targets with the previous section. The chat
section had none, so it takes `id="como-fazemos"` and the footer nav links to
all three.

**Anchor integrity is now tested**

The hero shipped links to `#contato` and `#servicos` long before either target
existed, and nothing caught it — both buttons were silent no-ops in production
for weeks. `app/page.test.tsx` now renders the whole page and asserts that every
`href="#..."` resolves to an element with that id, so the next dangling anchor
fails the build instead of shipping. The CTA's `'#'` placeholder is excluded by
length, since it is a tracked TODO rather than a mistake.

Verified by removing `id="contato"` and confirming the test fails.

**Build-time year**

`new Date().getFullYear()` is evaluated during prerender, so any redeploy
refreshes the copyright rather than leaving a year hardcoded in source. With
`output: "export"` this is a static value in the shipped HTML, not a runtime
call.

**Semantics**

`<footer>` sits as a sibling of the hero's `<main>`, so it is the page's
`contentinfo` landmark. The hero's own `<footer>` is scoped inside `<main>` and
is not a landmark, so the two do not collide. The nav has an accessible name
(`aria-label="Rodapé"`) since the page has more than one navigation region.

## Out of scope

- Social links, until real handles exist.
- A newsletter or contact form.
