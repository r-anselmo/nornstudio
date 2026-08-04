import { brandSignature, footerLinks, footerTagline } from '@/lib/footer'
import { NornBadge } from '@/components/ui/norn-badge'

export function SiteFooter() {
  // Evaluated at prerender, so a rebuild refreshes it rather than leaving a
  // stale year hardcoded in the source.
  const year = new Date().getFullYear()

  return (
    <footer className="bg-carbon-black px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {/* Echoes the hero header, closing the page with the mark it opened on. */}
        <div className="flex items-center gap-4">
          <NornBadge />
          <div className="h-px flex-1 bg-alabaster/30" />
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <p className="max-w-sm font-heading text-xl font-black leading-tight text-alabaster md:text-2xl">
            {footerTagline}
          </p>

          <nav aria-label="Rodapé">
            <ul className="flex flex-col gap-3 md:items-end">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="focus-ring rounded-sm font-body text-xs font-medium tracking-[0.02em] text-platinum-gray transition-colors duration-instant hover:text-lime motion-reduce:transition-none"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div aria-hidden="true" className="h-px bg-alabaster/10" />

        <div className="flex flex-col gap-2 font-body text-xs font-medium tracking-[0.02em] md:flex-row md:items-center md:justify-between">
          <p className="text-alabaster">© {year} NORN</p>
          <p className="text-platinum-gray">{brandSignature}</p>
        </div>
      </div>
    </footer>
  )
}
