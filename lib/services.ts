// Copy lives here rather than in JSX for the same reason as the chat script:
// `react/no-unescaped-entities` is error-level and rejects apostrophes and
// quotes in JSX text, but not string literals in a .ts module.

export type Service = {
  id: string
  title: string
  description: string
}

export const servicesEyebrow = 'Nossos serviços'

export const servicesHeading = 'Por onde você quiser começar'

export const servicesSubheading =
  'Comece por onde quiser. O importante é começar agora.'

export const services: Service[] = [
  {
    id: 'growth-design',
    title: 'Growth Design',
    description:
      'Unimos produto, dev e negócio pra fazer o crescimento acontecer',
  },
  {
    id: 'consultoria-ux-ui',
    title: 'Consultoria de UX/UI',
    description:
      'Transforme como seu produto é usado, remodelando a experiência de ponta a ponta',
  },
  {
    id: 'product-design',
    title: 'Product Design',
    description:
      'Transforme uma ideia em produto, remodelando cada decisão do problema ao lançamento',
  },
  {
    id: 'mentoria',
    title: 'Mentoria',
    description:
      'Da métrica à tela: seu time aprende o método Norn pra escalar seu negócio',
  },
]
