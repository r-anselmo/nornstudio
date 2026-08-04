import {
  services,
  servicesEyebrow,
  servicesHeading,
  servicesSubheading,
} from '@/lib/services'
import { SpotlightCard, SpotlightGroup } from '@/components/ui/spotlight-card'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import { Reveal } from '@/components/ui/reveal'
import { STAGGER_MS } from '@/lib/motion'

export function ServicesSection() {
  return (
    // The hero's "Ver serviços" link has always pointed at #servicos; this is
    // the section it was waiting for.
    <section
      id="servicos"
      className="bg-carbon-black px-6 py-16 md:px-12 md:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Reveal>
          <SectionEyebrow>{servicesEyebrow}</SectionEyebrow>
        </Reveal>

        <Reveal delay={STAGGER_MS} className="flex flex-col gap-6">
          <h2 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-4xl">
            {servicesHeading}
          </h2>
          <p className="max-w-md font-body text-base text-platinum-gray">
            {servicesSubheading}
          </p>
        </Reveal>

        <Reveal delay={STAGGER_MS * 2}>
          <SpotlightGroup className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((service, index) => (
              <SpotlightCard
                key={service.id}
                className="flex h-full flex-col gap-3 rounded-2xl border border-alabaster/10 border-l-alabaster/25 bg-alabaster/5 p-6 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none"
              >
                <h3 className="flex items-baseline gap-3 font-heading text-lg font-black text-alabaster">
                  <span>{`${index + 1}.`}</span>
                  <span>{service.title}</span>
                </h3>
                <p className="font-body text-base text-platinum-gray">
                  {service.description}
                </p>
              </SpotlightCard>
            ))}
          </SpotlightGroup>
        </Reveal>
      </div>
    </section>
  )
}
