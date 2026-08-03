import { ArrowRight } from 'lucide-react'
import {
  ctaEyebrow,
  ctaHeading,
  ctaHref,
  ctaLabel,
  ctaSubheading,
} from '@/lib/cta'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import { NornMark } from '@/components/ui/norn-mark'

export function CtaSection() {
  return (
    // The hero's "Iniciar Projeto" has always pointed at #contato; this is the
    // section it was waiting for.
    <section
      id="contato"
      className="relative overflow-hidden bg-lime px-6 py-16 md:px-12 md:py-24"
    >
      {/* Upright, never rotated: it is the logo, not a decorative squiggle.
          Sized so enough of the glyph clears the button to still read as the
          mark on a phone — smaller than this and it is just a smudge. */}
      <NornMark className="pointer-events-none absolute -bottom-20 -right-16 w-80 text-carbon-black/10 sm:w-96 md:-bottom-24 md:-right-20 md:w-[30rem]" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6">
        <SectionEyebrow tone="carbon">{ctaEyebrow}</SectionEyebrow>

        <h2 className="max-w-2xl font-heading text-3xl font-black leading-tight text-carbon-black md:text-5xl">
          {ctaHeading}
        </h2>
        <p className="max-w-md font-body text-base text-carbon-black/80">
          {ctaSubheading}
        </p>

        <a
          href={ctaHref}
          className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-carbon-black px-8 py-4 font-heading text-lg font-black text-alabaster transition-colors hover:bg-carbon-black/90 md:w-auto"
        >
          {ctaLabel}
          <ArrowRight className="h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
