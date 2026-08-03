// All chat copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and would reject apostrophes and quotes in JSX text.
// The rule only inspects JSX children, so string literals in a .ts module are safe.

export type ChatSender = 'client' | 'norn'

export type ChatAttachment = {
  // A string discriminator, not a LucideIcon: lucide-react has no 'use client',
  // so passing an icon reference into a client component breaks the build.
  kind: 'pdf' | 'doc'
  name: string
}

export type ChatMessage = {
  id: string
  sender: ChatSender
  lines: string[]
  /** Substring of the last line rendered in <strong>. */
  emphasis?: string
  attachment?: ChatAttachment
  reaction?: string
}

export type ChatPhase = {
  id: string
  step: string
  label: string
  messages: ChatMessage[]
}

export const chatFlowEyebrow = 'Como fazemos'

export const chatFlowHeading = 'Sem enrolação. Sem burocracia'

export const chatFlowSubheading =
  'Um recorte real de como um ciclo roda: do problema à solução e ao próximo teste.'

export const chatPhases: ChatPhase[] = [
  {
    id: 'descobrir',
    step: '01',
    label: 'DESCOBRIR',
    messages: [
      {
        id: 'descobrir-1',
        sender: 'client',
        lines: ['Queremos escalar 🚀!'],
      },
      {
        id: 'descobrir-2',
        sender: 'norn',
        lines: ['Qual métrica te tira o sono hoje?'],
      },
      {
        id: 'descobrir-3',
        sender: 'client',
        lines: ['Conversão está caindo e não sabemos a causa!'],
      },
      {
        id: 'descobrir-4',
        sender: 'norn',
        lines: ['Dados não mentem. Vamos analisar o funil e decidir juntos.'],
      },
    ],
  },
  {
    id: 'definir',
    step: '02',
    label: 'DEFINIR',
    messages: [
      {
        id: 'definir-1',
        sender: 'client',
        lines: ['Produto acha que é o onboarding, comercial acha que é preço.'],
      },
      {
        id: 'definir-2',
        sender: 'norn',
        lines: ['Conversamos com a equipe e levantamos as hipóteses'],
        attachment: { kind: 'pdf', name: 'backlog-hipoteses.pdf' },
      },
      {
        id: 'definir-3',
        sender: 'norn',
        lines: ['8 hipóteses, ICE score decide: onboarding será a primeira hipótese'],
        emphasis: 'onboarding',
      },
    ],
  },
  {
    id: 'desenvolver',
    step: '03',
    label: 'DESENVOLVER',
    messages: [
      {
        id: 'desenvolver-1',
        sender: 'norn',
        lines: ['Protótipo pronto.', 'MVP no ar, teste A/B rodando'],
        attachment: { kind: 'doc', name: 'onboarding-teste-ab.md' },
        reaction: '2 🔥',
      },
    ],
  },
  {
    id: 'entregar',
    step: '04',
    label: 'ENTREGAR',
    messages: [
      {
        id: 'entregar-1',
        sender: 'client',
        lines: ['E quando vamos ver resultados?'],
      },
      {
        id: 'entregar-2',
        sender: 'norn',
        lines: ['Variante B: +22% de ativação. shipando!'],
        emphasis: '+22% de ativação.',
      },
      {
        id: 'entregar-3',
        sender: 'client',
        lines: ['E agora?'],
      },
      {
        id: 'entregar-4',
        sender: 'norn',
        lines: ['Próxima hipótese entra amanhã. O processo é contínuo.'],
      },
    ],
  },
]
