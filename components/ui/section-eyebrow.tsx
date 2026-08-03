import type { ReactNode } from 'react'

/**
 * The bracketed section label. `tone` picks the colour for the surface it sits
 * on: lime on the dark sections, carbon on the lime CTA.
 *
 * Full class literals per tone rather than a template — Tailwind's scanner
 * cannot resolve names built at runtime.
 */
const tones = {
  lime: { text: 'text-lime', bracket: 'border-lime' },
  carbon: { text: 'text-carbon-black', bracket: 'border-carbon-black' },
} as const

export function SectionEyebrow({
  children,
  tone = 'lime',
}: {
  children: ReactNode
  tone?: keyof typeof tones
}) {
  const { text, bracket } = tones[tone]

  return (
    <span
      className={`relative inline-flex w-fit items-center px-3 py-1 font-body text-xs font-medium tracking-[0.02em] ${text}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-2 border-y border-l ${bracket}`}
      />
      {children}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 right-0 w-2 border-y border-r ${bracket}`}
      />
    </span>
  )
}
