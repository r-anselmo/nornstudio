import { ArrowRight } from 'lucide-react'
import {
  ctaEyebrow,
  ctaHeading,
  ctaHref,
  ctaLabel,
  ctaSubheading,
} from '@/lib/cta'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'

/**
 * Oversized brand mark, bled off the corner as a watermark.
 *
 * Stands in for the real logo, which has never been supplied — the same
 * placeholder situation as the text "N" in the hero and the chat avatars.
 * Inline rather than a file in `public/`: with `output: "export"` and the
 * GitHub Pages `basePath`, static assets do not get the prefix automatically.
 */
function NornMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 85V15l62 70V15" />
    </svg>
  )
}

export function CtaSection() {
  return (
    // The hero's "Iniciar Projeto" has always pointed at #contato; this is the
    // section it was waiting for.
    <section
      id="contato"
      className="relative overflow-hidden bg-lime px-6 py-16 md:px-12 md:py-24"
    >
      <NornMark className="pointer-events-none absolute -bottom-16 -right-10 w-64 rotate-12 text-carbon-black/10 md:w-96" />

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
