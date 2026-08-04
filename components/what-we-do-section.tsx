import {
  Database,
  LayoutGrid,
  Plug,
  Quote,
  TrendingUp,
  UserSearch,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SpotlightCard, SpotlightGroup } from '@/components/ui/spotlight-card'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'

type Skill = {
  label: string
  icon: LucideIcon
}

const skills: Skill[] = [
  { label: 'UI/UX', icon: LayoutGrid },
  { label: 'Prototyping', icon: Plug },
  { label: 'Growth', icon: TrendingUp },
  { label: 'Systems', icon: Workflow },
  { label: 'Data-Driven-Design', icon: Database },
  { label: 'Research', icon: UserSearch },
]

const buildingTags = ['Claude Code', 'Figma', 'Amplitude']

export function WhatWeDoSection() {
  return (
    <section className="bg-carbon-black px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <SectionEyebrow>O que estamos fazendo</SectionEyebrow>

        <SpotlightGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SpotlightCard className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 md:col-span-2 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none">
            <div className="flex items-start justify-between">
              <Quote className="h-6 w-6 text-lime" aria-hidden="true" />
              <span className="font-body text-xs text-platinum-gray">
                manifesto.txt
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black leading-tight text-alabaster">
              <span className="block">Decidimos o caminho.</span>
              <span className="block">Movemos o crescimento.</span>
            </h2>
            <p className="font-body text-base text-platinum-gray">
              Growth que nasce da escuta, vira experimento e chega em
              resultado.
            </p>
            <p className="font-body text-xs font-medium tracking-[0.02em] text-platinum-gray">
              NORNGROWTHDESIGN · SINCE 2026
            </p>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Habilidades
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {skills.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-alabaster/10 px-3 py-3 transition-colors duration-instant hover:bg-alabaster/20 motion-reduce:transition-none"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-alabaster"
                    aria-hidden="true"
                  />
                  <span className="font-body text-sm text-alabaster">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col gap-4 rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 transition-[transform,border-color] duration-fast ease-out-quad hover:-translate-y-0.5 hover:border-alabaster/25 motion-reduce:transition-none">
            <div className="flex justify-end">
              <span className="font-body text-xs text-platinum-gray">
                Atualmente construindo em
              </span>
            </div>
            <h3 className="font-heading text-lg font-black text-alabaster">
              CLAUDE CODE &amp; FIGMA
            </h3>
            <div className="flex flex-wrap gap-2">
              {buildingTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-alabaster/10 px-3 py-1 font-body text-sm text-alabaster transition-colors duration-instant hover:bg-alabaster/20 motion-reduce:transition-none"
                >
                  {tag}
                </span>
              ))}
            </div>
            <svg
              viewBox="0 0 32 16"
              className="h-4 w-8 text-lime"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="0" y="10" width="5" height="6" rx="1" />
              <rect x="9" y="6" width="5" height="10" rx="1" />
              <rect x="18" y="3" width="5" height="13" rx="1" />
              <rect x="27" y="0" width="5" height="16" rx="1" />
            </svg>
          </SpotlightCard>
        </SpotlightGroup>
      </div>
    </section>
  )
}
