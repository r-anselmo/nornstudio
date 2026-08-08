// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.

export const quizPageTitle = 'Diagnóstico de Growth'

export const quizPageDescription =
  'Descubra em poucos minutos o que está ajudando ou travando o crescimento do seu produto. 11 perguntas, 3 minutos, sem cadastro.'

/** The footer link on the home page. */
export const quizNavLabel = 'DIAGNÓSTICO'

/** The label in the quiz's own top bar. */
export const quizChromeLabel = 'DIAGNÓSTICO DE GROWTH'

export const quizIntroEyebrow = 'Diagnóstico de Growth'
export const quizIntroHeadline = 'Seu produto está crescendo —'
export const quizIntroHeadlineEmphasis = 'ou só está trabalhando mais?'
export const quizIntroLede =
  'Descubra em poucos minutos o que está ajudando ou travando o crescimento do seu produto, negócio ou projeto.'
export const quizIntroHow =
  'Responda 11 perguntas sobre como você trabalha hoje. Não existem respostas certas ou erradas — só um retrato mais honesto de onde você está. Leva cerca de 3 minutos.'
export const quizIntroPromise = 'Ao final, você recebe:'
export const quizIntroBullets = [
  'Sua nota de Growth, de 0 a 100 — um termômetro de como você está crescendo hoje',
  'Seus pontos fortes e gargalos — e o porquê de cada resultado',
  'Ações práticas para evoluir — baseadas na metodologia da Norn',
]
export const quizIntroClosing =
  'Pronto para descobrir onde está o seu próximo gargalo?'
export const quizStartLabel = 'Começar diagnóstico'
export const quizFinePrint =
  'Sem e-mail, sem cadastro. O resultado é seu, na hora.'

// The arrow ships inside the string: JSX text is where the unescaped-entities
// rule bites, and keeping it here means one place decides how back reads.
export const quizBackLabel = '← voltar'
export const quizProgressLabel = 'Progresso do diagnóstico'

export function quizPositionLabel(position: number, total: number): string {
  return `Pergunta ${position} de ${total}`
}

export const quizResultEyebrow = 'Resultado'
export const quizScaleLabel = '/ 100'

export function quizGaugeLabel(score: number): string {
  return `Sua nota de growth: ${score} de 100.`
}

export function quizContextLine(stage: string, goal: string): string {
  return `Estágio: ${stage} · Meta: ${goal}`
}

export function quizPointsLabel(score: number): string {
  return `${score} pts`
}

export const quizProfileHeading = 'Seu perfil por fase'
export const quizStrengthsHeading = 'Pontos fortes'
export const quizBottlenecksHeading = 'Gargalos'
export const quizNoStrengthsMessage =
  'Nenhuma fase passou de 66 pontos ainda — o ponto de partida está nos gargalos abaixo.'
export const quizNoBottlenecksMessage =
  'Nenhuma fase ficou abaixo de 66 pontos. O trabalho agora é proteger o que já funciona.'
export const quizWhyLabel = 'Por que isso importa:'
export const quizActionLabel = 'Próximo passo sugerido'

export const quizCtaTitle =
  'Esse número é um ponto de partida — não um diagnóstico completo.'
export const quizCtaBody =
  'A gente pode se aprofundar de verdade nos pontos de atenção, mapear o motor de crescimento do seu produto e desenhar os próximos passos junto com você.'
export const quizTalkLabel = 'Falar com a Norn'
export const quizShareLabel = 'Copiar link do resultado'
export const quizShareCopied = 'Link copiado.'
export const quizShareManual =
  'Não deu para copiar automaticamente. Selecione e copie o link:'
export const quizRestartLabel = 'Refazer diagnóstico'

/**
 * The bands, ordered by ceiling. `bandFor` in `lib/quiz-score.ts` takes the
 * first whose `maxScore` the score does not exceed. The thresholds live with
 * the copy because a band is a name, a description and the range it covers —
 * splitting the range away from the words it describes is how the two drift.
 */
export type QuizBand = {
  maxScore: number
  name: string
  description: string
}

export const quizBands: QuizBand[] = [
  {
    maxScore: 25,
    name: 'Crescimento no escuro',
    description:
      'Sem meta clara e sem motor identificado — as decisões ainda partem de vontade, não de direção.',
  },
  {
    maxScore: 50,
    name: 'Crescimento por sorte',
    description:
      'Existe algum resultado, mas ele não é compreendido nem reproduzível — depende de continuar dando certo.',
  },
  {
    maxScore: 75,
    name: 'Crescimento com direção',
    description:
      'Existe critério e processo, mas ainda falta estrutura que sustente o crescimento sem esforço manual constante.',
  },
  {
    maxScore: 100,
    name: 'Crescimento em loop',
    description:
      'O motor está identificado, estruturado, e se sustenta com pouca intervenção — o trabalho agora é proteger e acelerar.',
  },
]
