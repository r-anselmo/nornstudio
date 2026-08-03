import {
  services,
  servicesEyebrow,
  servicesHeading,
  servicesSubheading,
} from '@/lib/services'
import { SpotlightCard, SpotlightGroup } from '@/components/ui/spotlight-card'

export function ServicesSection() {
  return (
    <section className="bg-carbon-black px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <span className="relative inline-flex w-fit items-center px-3 py-1 font-body text-xs font-medium tracking-[0.02em] text-lime">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-2 border-y border-l border-lime"
          />
          {servicesEyebrow}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-2 border-y border-r border-lime"
          />
        </span>

        <h2 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-4xl">
          {servicesHeading}
        </h2>
        <p className="max-w-md font-body text-base text-platinum-gray">
          {servicesSubheading}
        </p>

        <SpotlightGroup className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service, index) => (
            <SpotlightCard
              key={service.id}
              className="flex flex-col gap-3 rounded-2xl border border-alabaster/10 border-l-alabaster/25 bg-alabaster/5 p-6"
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
      </div>
    </section>
  )
}
