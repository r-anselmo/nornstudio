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

/**
 * The accessible name for one row in `quiz-phase-bars.tsx`. Sighted readers
 * pair a phase's name with its score because they sit on the same row; this
 * gives a screen reader the same pairing as one statement, same idea as
 * `quizGaugeLabel` above for the ring.
 */
export function quizPhaseScoreLabel(name: string, score: number): string {
  return `${name}: nota ${score} de 100.`
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

/**
 * Take the threshold as a parameter rather than quoting it: the number is
 * `STRENGTH_MIN_SCORE` in `lib/quiz-score.ts`, and this module cannot import
 * that constant directly without a circular import (`quiz-score.ts` already
 * imports `quizBands` from here). Letting the caller — which already has the
 * constant — pass it in keeps the copy from quietly drifting out of sync with
 * the score it describes, the same failure `quizBands`' own comment below
 * warns about.
 */
export function quizNoStrengthsMessage(minScore: number): string {
  return `Nenhuma fase passou de ${minScore} pontos ainda — o ponto de partida está nos gargalos abaixo.`
}

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
/** Names the read-only fallback field itself — distinct from `quizShareLabel`,
 * which names the button's action, so tabbing between the two doesn't repeat
 * the same accessible name on an imperative control and a passive one. */
export const quizShareLinkLabel = 'Link do resultado'
export const quizRestartLabel = 'Refazer diagnóstico'

export const quizHorizonHeading = 'Seu próximo horizonte'

export const quizHorizonLegendAlone = 'Ritmo sozinho'
export const quizHorizonLegendWithNorn = 'Ritmo com a Norn'
export const quizHorizonYouAreHere = 'Você está aqui'

export const quizHorizonAxisLabels = ['Hoje', '+3m', '+6m', '+9m', '+12m']

/** Always shown, fixed, never score-dependent — the line that keeps the
 *  chart from reading as a real statistical projection. */
export const quizHorizonDisclaimer =
  'Ilustração do próximo horizonte — não uma projeção calculada. Sozinho, o motor que já funciona tende a esbarrar no teto que ele mesmo criou. Com um olhar de fora questionando as próprias decisões, esse teto é o próximo ponto a romper.'

/**
 * Names the single biggest bottleneck under the chart. Takes the name as a
 * parameter, same reasoning as `quizNoStrengthsMessage` above: this module
 * cannot import from `lib/quiz-score.ts` (circular import), so the caller —
 * which already ran `highlights()` — passes in what it already has.
 */
export function quizHorizonBottleneckText(bottleneckName: string): string {
  return `${bottleneckName} é o gargalo que mais está segurando esse teto no lugar hoje — resolver isso é o que abre o próximo patamar.`
}

/**
 * The chart wrapper's `role="img"` `aria-label` — describes the shape only;
 * the "why" is carried by the legend, disclaimer and support text beside it,
 * same split `quizGaugeLabel` uses for the ring.
 */
export function quizHorizonChartLabel(score: number): string {
  return `Gráfico ilustrativo do próximo horizonte a partir da nota ${score} de 100: o ritmo sozinho se aproxima de um teto sem ultrapassá-lo, o ritmo com a Norn ultrapassa esse teto.`
}

export const quizPerfectHeadline =
  'Você já resolveu o que a maioria das empresas nunca chega a resolver. A pergunta deixou de ser "como crescer" e virou "até onde esse motor aguenta ir" — novo mercado, novo canal, novo teto.'

/**
 * Reused as-is in two places: the horizon chart's support-text slot when
 * `isPerfectScore` is true, and directly below `quizPerfectHeadline` in the
 * block that replaces Gargalos. Import it in both places — never duplicate
 * the string.
 */
export const quizPerfectSupportText =
  'Você zerou o diagnóstico em todas as fases — sintoma qualificado, motor mapeado, priorização, MVP, arquitetura, caminho até o valor, teste instrumentado e loop girando. Isso não é comum, e o risco que vem junto é diferente do risco de quem está começando: não é o que está quebrado, é o que ninguém está mais questionando.'

/** Replaces `quizCtaBody` when `isPerfectScore` is true. `quizCtaTitle`
 *  stays the same in both cases — only the body was asked to change. */
export const quizCtaBodyPerfect =
  'Vamos descobrir juntos qual é o próximo teto do seu motor, antes de ele aparecer sozinho.'

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
