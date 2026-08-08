# Growth Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/quiz` — Norn's eleven-question growth diagnostic — as a real
route on the site, rebuilt on the brand's tokens and atoms, with a shareable
result link and a contact CTA that carries the result into the inbox.

**Architecture:** One client component (`QuizExperience`) owns a `useReducer`
over `{ screen, index, answers }`; every screen below it is presentation taking
props. Score, band, strengths and bottlenecks are never stored — they are
derived from the eleven answers by pure functions in `lib/`, so a shared link
and a freshly-finished quiz cannot disagree. The URL is read once on mount and
written only when the visitor asks for a link.

**Tech Stack:** Next.js 16 (static export, `trailingSlash`, GitHub Pages
basePath), React 19, Tailwind CSS 4 with Norn's `@theme` tokens, Vitest +
Testing Library + user-event, `lucide-react` icons.

**Spec:** `docs/superpowers/specs/2026-08-08-growth-quiz-design.md`

---

## Verified facts this plan depends on

Checked against this repo, not assumed:

- `next/link` renders in this Vitest setup with no router mock —
  `components/hero-section.test.tsx` already uses it and passes.
- `SpotlightGroup` finds cards via `querySelectorAll('[data-spotlight-card]')`,
  so a mapped `QuizInsightCard` inside it works at any nesting depth.
- `SpotlightCard` carries no padding, border or radius of its own; the caller
  supplies them via `className`.
- `SectionEyebrow` defaults to `tone="lime"`, correct for a carbon-black
  surface.
- `Array.prototype.sort` is stable (ES2019), which is what makes tied phase
  scores keep their 00→08 order.
- `react/no-unescaped-entities` is error-level, so no Portuguese copy with
  apostrophes may appear in JSX. Every string comes from `lib/`.
- The existing `components/site-footer.test.tsx` iterates `footerLinks` and
  asserts `getByRole('link', { name: label })` has the matching `href`. This
  only holds once `vitest.setup.ts` sets `process.env.__NEXT_TRAILING_SLASH =
  '1'`: `next/link` inlines that flag from `next.config.ts`'s `trailingSlash:
  true` during a real build, and without it — the situation this plan
  originally shipped in — `next/link` strips the trailing slash off *any*
  href it renders, regardless of what string you pass it, so `/quiz/` came
  out as `/quiz`. (Verified independently: with the flag unset, both
  `href="/quiz/"` and `href="/quiz"` render `/quiz`; with it set to `'1'`,
  both render `/quiz/`.) With the flag set to match the build config, a
  `next/link` to `/quiz/` renders `<a href="/quiz/">`, and that test keeps
  passing unchanged.
- `app/page.test.tsx` only validates anchors matching `a[href^="#"]`, so a
  route link in the footer does not trip it.
- Durations are real utilities in this repo (`duration-instant`,
  `duration-fast`, `duration-base`, `duration-slow`, `duration-deliberate`) and
  easings are `ease-out-quad` / `ease-out-expo` / `ease-spring`.

## File structure

**Create:**

- `lib/quiz.ts` — every string the page renders, plus the band table.
- `lib/quiz-questions.ts` — the eleven questions and their types.
- `lib/quiz-score.ts` — pure scoring, banding, strengths/bottlenecks.
- `lib/quiz-share.ts` — `?r=` encode/decode and the share URL.
- `lib/quiz-message.ts` — the contact-dialog prefill built from a result.
- `lib/use-armed.ts` — "false on first paint, true next frame", so a CSS
  transition has a start state to run from.
- `components/quiz-gauge.tsx` — the SVG ring and score.
- `components/quiz-phase-bars.tsx` — nine labelled bars.
- `components/quiz-insight-card.tsx` — one card, strength or bottleneck.
- `components/quiz-share-button.tsx` — copies the result link.
- `components/quiz-intro.tsx` — the opening screen.
- `components/quiz-question.tsx` — one question screen.
- `components/quiz-result.tsx` — the result screen.
- `components/quiz-experience.tsx` — the only stateful component.
- `app/quiz/page.tsx` — route and metadata.
- A `.test.ts`/`.test.tsx` beside each of the above.

**Modify:**

- `components/contact-dialog-provider.tsx` — `open()` takes an optional prefill.
- `components/contact-trigger.tsx` — optional `message` prop.
- `components/contact-dialog.tsx` — the form starts from the prefill.
- `components/contact-dialog.test.tsx` — two new cases.
- `lib/footer.ts` — the new footer link.
- `components/site-footer.tsx` — render route links with `next/link`.

---

## Task 1: Questions and copy

**Files:**
- Create: `lib/quiz-questions.ts`
- Create: `lib/quiz.ts`
- Test: `lib/quiz-questions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/quiz-questions.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  FIRST_PHASE_INDEX,
  QUESTION_COUNT,
  contextQuestion,
  goalQuestion,
  optionCountAt,
  phases,
  questionAt,
} from './quiz-questions'

describe('quiz questions', () => {
  it('asks eleven questions: two of context, nine of phase', () => {
    expect(phases).toHaveLength(9)
    expect(QUESTION_COUNT).toBe(11)
    expect(FIRST_PHASE_INDEX).toBe(2)
  })

  it('gives every phase exactly four options', () => {
    // The option index IS the score in lib/quiz-score.ts. A phase with three
    // or five options would score silently wrong rather than fail.
    for (const phase of phases) {
      expect(phase.options).toHaveLength(4)
    }
  })

  it('gives the context question four options and the goal question five', () => {
    expect(contextQuestion.options).toHaveLength(4)
    expect(goalQuestion.options).toHaveLength(5)
  })

  it('reports the option count for every question index', () => {
    expect(optionCountAt(0)).toBe(4)
    expect(optionCountAt(1)).toBe(5)
    for (let index = FIRST_PHASE_INDEX; index < QUESTION_COUNT; index++) {
      expect(optionCountAt(index)).toBe(4)
    }
  })

  it('resolves a question from its index', () => {
    expect(questionAt(0).question).toBe(contextQuestion.question)
    expect(questionAt(1).question).toBe(goalQuestion.question)
    expect(questionAt(2).question).toBe(phases[0].question)
    expect(questionAt(10).question).toBe(phases[8].question)
  })

  it('carries no empty copy', () => {
    // The source mock was mis-encoded; a bad paste drops text rather than
    // erroring, and an empty option renders as an unlabelled button.
    for (const phase of phases) {
      expect(phase.tag.length).toBeGreaterThan(0)
      expect(phase.name.length).toBeGreaterThan(0)
      expect(phase.question.length).toBeGreaterThan(0)
      expect(phase.principle.length).toBeGreaterThan(0)
      expect(phase.action.length).toBeGreaterThan(0)
      for (const option of phase.options) {
        expect(option.length).toBeGreaterThan(0)
      }
    }
  })

  it('names every phase uniquely', () => {
    // Names are React keys and the identity used to exclude a strength from
    // the bottlenecks.
    expect(new Set(phases.map((phase) => phase.name)).size).toBe(phases.length)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/quiz-questions.test.ts`
Expected: FAIL — `Failed to resolve import "./quiz-questions"`.

- [ ] **Step 3: Write `lib/quiz-questions.ts`**

```ts
// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.
//
// This is the diagnostic's source of truth. `lib/quiz-score.ts` reads the
// option order — index 0 is always the weakest answer and index 3 the
// strongest — so reordering options here silently rewrites every score.

export type QuizPhase = {
  /** The label above the question, e.g. 'Fase 00 · Qualificação do sintoma'. */
  tag: string
  /** The short form, used as the bar and card label where the tag is too long. */
  name: string
  question: string
  /** Exactly four, ordered weakest to strongest. */
  options: string[]
  principle: string
  action: string
}

export type QuizContextQuestion = {
  tag: string
  question: string
  options: string[]
}

export const contextQuestion: QuizContextQuestion = {
  tag: 'Contexto',
  question: 'Qual desses cenários descreve melhor onde vocês estão hoje?',
  options: [
    'Ainda não lançamos — estamos em ideação',
    'Lançamos, mas ainda sem tração relevante',
    'Temos tração, mas sem clareza de origem ou direção',
    'Temos tração e direção, e queremos acelerar',
  ],
}

export const goalQuestion: QuizContextQuestion = {
  tag: 'Contexto',
  question: 'Qual desses resultados mais representa o que você busca agora?',
  options: [
    'Ser conhecido — ter autoridade e reconhecimento no meu mercado',
    'Ter um produto usado com frequência — engajamento e recorrência de uso',
    'Ter uma renda recorrente e previsível',
    'Crescer em número de clientes ou usuários',
    'Expandir para novos mercados ou públicos',
  ],
}

export const phases: QuizPhase[] = [
  {
    tag: 'Fase 00 · Qualificação do sintoma',
    name: 'Qualificação do sintoma',
    question:
      'Quando vocês falam em crescer, dá pra traduzir isso numa meta específica e mensurável?',
    options: [
      'Não, é mais uma vontade geral de crescer',
      'Sim, mas muda dependendo de quem pergunta',
      'Sim, é clara, mas não é compartilhada por todo o time',
      'Sim, é clara, mensurável, e todo mundo que decide conhece',
    ],
    principle:
      'O que se pede sem número é sintoma, não meta — e nenhuma decisão boa se toma em cima de sintoma não qualificado.',
    action:
      'Antes de qualquer ação, transformem a vontade de crescer em um número único, específico, conhecido por quem decide.',
  },
  {
    tag: 'Fase 01 · De onde vem o motor',
    name: 'De onde vem o motor',
    question:
      'Vocês sabem explicar de onde vem o crescimento (ou tração) que já existe hoje?',
    options: [
      'Ainda não temos crescimento ou tração',
      'Temos, mas não sabemos explicar por quê',
      'Temos uma hipótese, mas nunca confirmamos com dado',
      'Sabemos exatamente de onde vem, e conseguimos reproduzir',
    ],
    principle:
      'Tração sem explicação é sorte, não motor — e sorte não escala por decisão, só por acidente.',
    action:
      'Mapeiem com dado — não achismo — qual canal, gatilho ou comportamento realmente gera o resultado que já existe.',
  },
  {
    tag: 'Fase 02 · Diz, precisa, não sabe que precisa',
    name: 'Diz, precisa, não sabe que precisa',
    question:
      'Como vocês decidem o que o usuário realmente precisa, antes de construir algo?',
    options: [
      'Construímos com base no que a gente acha que faz sentido',
      'Perguntamos, e implementamos exatamente o que pedem',
      'Conversamos com usuários, mas sem processo formal',
      'Processo estruturado que separa o que pedem do que resolve o problema de fato',
    ],
    principle:
      'O que o usuário pede é sintoma; o requisito de verdade só aparece quando alguém qualifica esse pedido.',
    action:
      'Rodem entrevistas abertas — sem sugerir solução — com quem já usa o produto, antes do próximo ciclo.',
  },
  {
    tag: 'Fase 03 · Importância × Viabilidade',
    name: 'Importância × Viabilidade',
    question:
      'Como vocês priorizam entre várias oportunidades de crescimento possíveis?',
    options: [
      'Prioridade muda conforme quem pede por último ou grita mais alto',
      'Por instinto ou experiência, sem critério formal',
      'Temos critério (ex: impacto x esforço), mas nem sempre seguimos',
      'Critério formal, seguido de forma consistente',
    ],
    principle:
      'Sem critério explícito, prioridade vira política interna — a hipótese mais importante perde pra mais barulhenta.',
    action:
      'Listem as oportunidades atuais e pontuem cada uma em importância x viabilidade antes da próxima decisão.',
  },
  {
    tag: 'Fase 04 · Hipóteses no orçamento',
    name: 'Hipóteses no orçamento',
    question:
      'Antes de construir algo novo por completo, vocês testam uma versão mínima primeiro?',
    options: [
      'Não, construímos a versão completa direto',
      'Às vezes, dependendo do projeto',
      'Geralmente sim, mas sem critério claro de quando parar de testar',
      'Sempre validamos com a menor versão possível antes de investir mais',
    ],
    principle:
      'Toda hipótese não testada é uma aposta — o MVP existe pra pagar o preço do erro antes dele ficar caro.',
    action:
      'Peguem a próxima hipótese da lista e definam, antes de começar, qual é a menor versão capaz de gerar sinal.',
  },
  {
    tag: 'Fase 05 · Arquitetura de canais e loops',
    name: 'Arquitetura de canais e loops',
    question:
      'O crescimento de vocês depende de esforço manual constante, ou existe estrutura que se sustenta sozinha?',
    options: [
      'Depende 100% de esforço manual ou mídia paga constante',
      'Mistura de esforço manual com alguma estrutura, mas frágil',
      'Existe estrutura, ainda com forte dependência de canais pagos',
      'Existe estrutura de canais e loops que se sustenta com pouca intervenção',
    ],
    principle:
      'Sem arquitetura, todo resultado exige repetir o esforço do zero — crescimento vira trabalho, não motor.',
    action:
      'Mapeiem como uma ação do usuário hoje leva (ou não leva) à próxima, sem depender de vocês empurrarem.',
  },
  {
    tag: 'Fase 06 · Caminho até o valor',
    name: 'Caminho até o valor',
    question:
      'Vocês sabem quanto tempo (ou quantos passos) um novo usuário leva até sentir o valor real do produto?',
    options: [
      'Não sabemos medir isso',
      'Sabemos que demora, mas nunca medimos exatamente',
      'Medimos, mas o caminho ainda é longo ou tem fricção',
      'Medimos, e o caminho é curto e direto',
    ],
    principle:
      'Todo passo entre a entrada e o valor sentido é uma chance do usuário desistir antes de confiar.',
    action:
      'Desenhem o caminho real — não o ideal — do primeiro clique até o primeiro valor sentido, e contem os passos.',
  },
  {
    tag: 'Fase 07 · Instrumentação do experimento',
    name: 'Instrumentação do experimento',
    question:
      'Quando testam algo novo, vocês definem o critério de sucesso antes de rodar o teste?',
    options: [
      'Não, avaliamos depois se parece que funcionou',
      'Às vezes, mas de forma informal',
      'Definimos, mas nem sempre seguimos à risca',
      'Sempre definimos antes, e comparamos o resultado a isso',
    ],
    principle:
      'Sem critério definido antes, todo resultado ambíguo vira confirmação do que já se queria acreditar.',
    action:
      'No próximo teste, escrevam antes de rodar: o que conta como sucesso, e o que conta como sinal de que não funcionou.',
  },
  {
    tag: 'Fase 08 · O motor de crescimento',
    name: 'O motor de crescimento',
    question:
      'Os usuários que já usam o produto voltam e trazem outros, ou cada resultado novo depende de trazer gente nova?',
    options: [
      'Cada resultado depende inteiramente de trazer gente nova',
      'Alguns voltam, mas não sabemos por quê nem como reforçar isso',
      'Existe retenção ou indicação, mas não é intencional',
      'Existe um loop claro de retorno e indicação que se reforça sozinho',
    ],
    principle:
      'Uma conversão isolada é evento, não crescimento — o motor só existe quando o ciclo se repete sem esforço novo a cada vez.',
    action:
      'Identifiquem o momento em que um usuário satisfeito poderia indicar ou voltar sozinho, e removam a fricção desse momento.',
  },
]

/** Where the scored questions start in an answers array. */
export const FIRST_PHASE_INDEX = 2

/** Context, goal, then one per phase. */
export const QUESTION_COUNT = FIRST_PHASE_INDEX + phases.length

/**
 * How many options a question offers. `lib/quiz-share.ts` validates a shared
 * link against this, so a tampered digit cannot select an option that does
 * not exist.
 */
export function optionCountAt(questionIndex: number): number {
  return questionAt(questionIndex).options.length
}

export function questionAt(questionIndex: number): QuizContextQuestion | QuizPhase {
  if (questionIndex === 0) return contextQuestion
  if (questionIndex === 1) return goalQuestion
  return phases[questionIndex - FIRST_PHASE_INDEX]
}
```

- [ ] **Step 4: Write `lib/quiz.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/quiz-questions.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/quiz.ts lib/quiz-questions.ts lib/quiz-questions.test.ts
git commit -m "feat: add the growth quiz questions and copy"
```

---

## Task 2: Scoring

**Files:**
- Create: `lib/quiz-score.ts`
- Test: `lib/quiz-score.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/quiz-score.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  MIN_SCORE_OPACITY,
  bandFor,
  highlights,
  isComplete,
  phaseResults,
  scoreOpacity,
  totalScore,
} from './quiz-score'
import { QUESTION_COUNT, phases } from './quiz-questions'
import { quizBands } from './quiz'

/** Eleven answers where every phase takes the same option. */
function answersWith(option: number): number[] {
  return [0, 0, ...Array<number>(phases.length).fill(option)]
}

describe('isComplete', () => {
  it('rejects an unfinished quiz', () => {
    const answers: (number | null)[] = Array(QUESTION_COUNT).fill(null)
    answers[0] = 1
    expect(isComplete(answers)).toBe(false)
  })

  it('rejects an array of the wrong length', () => {
    expect(isComplete([0, 1, 2])).toBe(false)
  })

  it('accepts eleven answered questions', () => {
    expect(isComplete(answersWith(3))).toBe(true)
  })
})

describe('phaseResults', () => {
  it('scores each phase from its option index', () => {
    const results = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])

    expect(results).toHaveLength(9)
    expect(results.map((result) => result.score)).toEqual([
      0, 33, 66, 100, 0, 33, 66, 100, 0,
    ])
  })

  it('keeps the phase copy alongside the score', () => {
    const results = phaseResults(answersWith(3))

    expect(results[0].name).toBe(phases[0].name)
    expect(results[0].principle).toBe(phases[0].principle)
    expect(results[0].action).toBe(phases[0].action)
  })
})

describe('totalScore', () => {
  it('is 0 when every phase takes the weakest option', () => {
    expect(totalScore(phaseResults(answersWith(0)))).toBe(0)
  })

  it('is 100 when every phase takes the strongest option', () => {
    expect(totalScore(phaseResults(answersWith(3)))).toBe(100)
  })

  it('rounds the mean of the nine phases', () => {
    // Eight at 0 and one at 100 → 100/9 = 11.11…
    const results = phaseResults([0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(totalScore(results)).toBe(11)
  })
})

describe('bandFor', () => {
  it('places a score in the band whose ceiling it does not exceed', () => {
    expect(bandFor(0).name).toBe(quizBands[0].name)
    expect(bandFor(25).name).toBe(quizBands[0].name)
    expect(bandFor(26).name).toBe(quizBands[1].name)
    expect(bandFor(50).name).toBe(quizBands[1].name)
    expect(bandFor(51).name).toBe(quizBands[2].name)
    expect(bandFor(75).name).toBe(quizBands[2].name)
    expect(bandFor(76).name).toBe(quizBands[3].name)
    expect(bandFor(100).name).toBe(quizBands[3].name)
  })
})

describe('highlights', () => {
  it('finds no bottleneck when every phase is at the top', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(3)))

    // The mock still printed three "gargalos" cards here, each reading 100 pts.
    expect(bottlenecks).toEqual([])
    expect(strengths).toHaveLength(2)
    expect(strengths.every((result) => result.score === 100)).toBe(true)
  })

  it('finds no strength when every phase is at the bottom', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(0)))

    expect(strengths).toEqual([])
    expect(bottlenecks).toHaveLength(3)
  })

  it('never lists the same phase as both a strength and a bottleneck', () => {
    // Every phase tied at 66 is the case that broke the mock: it is eligible
    // for both lists at once.
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(2)))

    const strengthNames = strengths.map((result) => result.name)
    const overlap = bottlenecks.filter((result) =>
      strengthNames.includes(result.name)
    )
    expect(overlap).toEqual([])
    expect(strengths).toHaveLength(2)
    expect(bottlenecks).toHaveLength(3)
  })

  it('breaks ties by phase order, so a shared link is deterministic', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(2)))

    expect(strengths.map((result) => result.name)).toEqual([
      phases[0].name,
      phases[1].name,
    ])
    expect(bottlenecks.map((result) => result.name)).toEqual([
      phases[2].name,
      phases[3].name,
      phases[4].name,
    ])
  })

  it('ranks strengths highest first and bottlenecks lowest first', () => {
    // Phases 0..8 take options 0,1,2,3,3,2,1,0,3 → 0,33,66,100,100,66,33,0,100
    const results = phaseResults([0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 3])
    const { strengths, bottlenecks } = highlights(results)

    expect(strengths.map((result) => result.score)).toEqual([100, 100])
    expect(strengths.map((result) => result.name)).toEqual([
      phases[3].name,
      phases[4].name,
    ])
    expect(bottlenecks.map((result) => result.score)).toEqual([0, 0, 33])
    expect(bottlenecks.map((result) => result.name)).toEqual([
      phases[0].name,
      phases[7].name,
      phases[1].name,
    ])
  })
})

describe('scoreOpacity', () => {
  it('never fades a bar out completely', () => {
    expect(scoreOpacity(0)).toBe(MIN_SCORE_OPACITY)
  })

  it('reaches full strength at 100', () => {
    expect(scoreOpacity(100)).toBe(1)
  })

  it('rises with the score', () => {
    expect(scoreOpacity(50)).toBeGreaterThan(scoreOpacity(0))
    expect(scoreOpacity(100)).toBeGreaterThan(scoreOpacity(50))
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/quiz-score.test.ts`
Expected: FAIL — `Failed to resolve import "./quiz-score"`.

- [ ] **Step 3: Write `lib/quiz-score.ts`**

```ts
import { quizBands } from '@/lib/quiz'
import type { QuizBand } from '@/lib/quiz'
import { FIRST_PHASE_INDEX, QUESTION_COUNT, phases } from '@/lib/quiz-questions'
import type { QuizPhase } from '@/lib/quiz-questions'

/** Option index → score. Four options per phase, weakest to strongest. */
export const PHASE_SCORES = [0, 33, 66, 100]

/** At or above this, a phase is something to protect. */
export const STRENGTH_MIN_SCORE = 66
/** At or below this, a phase is something to work on. */
export const BOTTLENECK_MAX_SCORE = 66

export const MAX_STRENGTHS = 2
export const MAX_BOTTLENECKS = 3

/** A bar at zero still has to be visible, or the row reads as missing. */
export const MIN_SCORE_OPACITY = 0.4

export type PhaseResult = QuizPhase & { score: number }

/**
 * Narrows the reducer's `(number | null)[]` once every question is answered,
 * which is the only state in which anything below may be called.
 */
export function isComplete(
  answers: readonly (number | null)[]
): answers is number[] {
  return (
    answers.length === QUESTION_COUNT &&
    answers.every((answer) => answer !== null)
  )
}

export function phaseResults(answers: readonly number[]): PhaseResult[] {
  return phases.map((phase, index) => ({
    ...phase,
    score: PHASE_SCORES[answers[index + FIRST_PHASE_INDEX]] ?? 0,
  }))
}

export function totalScore(results: readonly PhaseResult[]): number {
  const sum = results.reduce((total, result) => total + result.score, 0)
  return Math.round(sum / results.length)
}

export function bandFor(score: number): QuizBand {
  return (
    quizBands.find((band) => score <= band.maxScore) ??
    quizBands[quizBands.length - 1]
  )
}

/**
 * The two lists the result screen shows, computed together so they cannot
 * overlap — the mock derived them from independent sorts and printed the same
 * phase as both a strength and a bottleneck whenever scores tied.
 *
 * `sort` is stable, and `results` arrives in phase order, so equal scores keep
 * their 00 → 08 order. That is what makes a shared link render identically
 * every time it is opened.
 */
export function highlights(results: readonly PhaseResult[]): {
  strengths: PhaseResult[]
  bottlenecks: PhaseResult[]
} {
  const strengths = [...results]
    .filter((result) => result.score >= STRENGTH_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_STRENGTHS)

  const claimed = new Set(strengths.map((result) => result.name))

  const bottlenecks = [...results]
    .filter(
      (result) =>
        result.score <= BOTTLENECK_MAX_SCORE && !claimed.has(result.name)
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_BOTTLENECKS)

  return { strengths, bottlenecks }
}

/**
 * How solid a bar or the gauge ring paints. Norn has no red, so a weak score
 * cannot change hue the way the source mock did — it stays lime and loses
 * opacity. Every bar prints its number too, because opacity alone is not a
 * safe carrier of meaning.
 */
export function scoreOpacity(score: number): number {
  const opacity = MIN_SCORE_OPACITY + (1 - MIN_SCORE_OPACITY) * (score / 100)
  return Number(opacity.toFixed(2))
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/quiz-score.test.ts`
Expected: PASS, 17 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/quiz-score.ts lib/quiz-score.test.ts
git commit -m "feat: score the growth quiz without overlapping highlights"
```

---

## Task 3: Share links

**Files:**
- Create: `lib/quiz-share.ts`
- Test: `lib/quiz-share.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/quiz-share.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  SHARE_PARAM,
  buildShareUrl,
  decodeAnswers,
  encodeAnswers,
  readSharedAnswers,
} from './quiz-share'
import { QUESTION_COUNT } from './quiz-questions'

const answers = [3, 4, 0, 1, 2, 3, 0, 1, 2, 3, 0]

describe('encodeAnswers / decodeAnswers', () => {
  it('round trips a complete answer set', () => {
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers)
  })

  it('stamps the format version so old links fail closed', () => {
    const encoded = encodeAnswers(answers)

    expect(encoded).toHaveLength(QUESTION_COUNT + 1)
    expect(encoded.startsWith('1')).toBe(true)
    expect(decodeAnswers(`9${encoded.slice(1)}`)).toBeNull()
  })

  it('rejects a link of the wrong length', () => {
    expect(decodeAnswers('1030')).toBeNull()
    expect(decodeAnswers(`${encodeAnswers(answers)}0`)).toBeNull()
  })

  it('rejects anything that is not digits', () => {
    expect(decodeAnswers('1abcdefghijk')).toBeNull()
    expect(decodeAnswers('1 0000000000')).toBeNull()
  })

  it('rejects an option that does not exist for its question', () => {
    // Twelve characters each: the version digit plus eleven answers.
    // Question 0 offers four options, so a 4 in the first slot is out of range…
    expect(decodeAnswers('140000000000')).toBeNull()
    // …while question 1 offers five, so a 4 in the second slot is legitimate.
    expect(decodeAnswers('104000000000')).toEqual([
      0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ])
  })

  it('rejects empty input', () => {
    expect(decodeAnswers('')).toBeNull()
    expect(decodeAnswers(null)).toBeNull()
  })
})

describe('readSharedAnswers', () => {
  it('reads the answers out of a query string', () => {
    expect(readSharedAnswers(`?${SHARE_PARAM}=${encodeAnswers(answers)}`)).toEqual(
      answers
    )
  })

  it('returns null when the parameter is absent or junk', () => {
    expect(readSharedAnswers('')).toBeNull()
    expect(readSharedAnswers('?foo=bar')).toBeNull()
    expect(readSharedAnswers(`?${SHARE_PARAM}=lixo`)).toBeNull()
  })
})

describe('buildShareUrl', () => {
  it('builds the link from the current location, basePath included', () => {
    window.history.replaceState({}, '', '/nornstudio/quiz/')

    expect(buildShareUrl(answers)).toBe(
      `${window.location.origin}/nornstudio/quiz/?${SHARE_PARAM}=${encodeAnswers(answers)}`
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/quiz-share.test.ts`
Expected: FAIL — `Failed to resolve import "./quiz-share"`.

- [ ] **Step 3: Write `lib/quiz-share.ts`**

```ts
import { QUESTION_COUNT, optionCountAt } from '@/lib/quiz-questions'

/**
 * Bumped whenever a question or its options change. Without it a link shared
 * before the change would still decode — onto different answers — and show a
 * result its author never got.
 */
const FORMAT_VERSION = '1'

export const SHARE_PARAM = 'r'

/**
 * One digit per question. Safe because the widest question offers five
 * options; a question with ten would need a different alphabet.
 */
export function encodeAnswers(answers: readonly number[]): string {
  return FORMAT_VERSION + answers.join('')
}

export function decodeAnswers(value: string | null): number[] | null {
  if (!value) return null
  if (value.length !== FORMAT_VERSION.length + QUESTION_COUNT) return null
  if (!value.startsWith(FORMAT_VERSION)) return null

  const digits = value.slice(FORMAT_VERSION.length)
  if (!/^[0-9]+$/.test(digits)) return null

  const answers = [...digits].map(Number)
  const inRange = answers.every((answer, index) => answer < optionCountAt(index))

  return inRange ? answers : null
}

export function readSharedAnswers(search: string): number[] | null {
  return decodeAnswers(new URLSearchParams(search).get(SHARE_PARAM))
}

/**
 * Built from `location` rather than from `siteUrl`: the GitHub Pages build
 * serves the site under a `/nornstudio` basePath, which a hardcoded origin
 * would drop and hand the visitor a 404.
 */
export function buildShareUrl(answers: readonly number[]): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}?${SHARE_PARAM}=${encodeAnswers(answers)}`
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/quiz-share.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/quiz-share.ts lib/quiz-share.test.ts
git commit -m "feat: encode a quiz result into a shareable link"
```

---

## Task 4: The contact message built from a result

**Files:**
- Create: `lib/quiz-message.ts`
- Test: `lib/quiz-message.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/quiz-message.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildContactMessage } from './quiz-message'
import { phaseResults } from './quiz-score'
import { contextQuestion, goalQuestion, phases } from './quiz-questions'

const answers = [2, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3]

describe('buildContactMessage', () => {
  it('opens with the score and the band', () => {
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks: [],
    })

    expect(message).toContain('55/100')
    expect(message).toContain('Crescimento com direção')
  })

  it('carries the stage and the goal the visitor chose', () => {
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks: [],
    })

    expect(message).toContain(contextQuestion.options[2])
    expect(message).toContain(goalQuestion.options[1])
  })

  it('lists every bottleneck with its score', () => {
    const bottlenecks = phaseResults(answers).slice(0, 3)
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks,
    })

    for (const bottleneck of bottlenecks) {
      expect(message).toContain(bottleneck.name)
    }
    expect(message).toContain(`${phases[0].name} (0 pts)`)
  })

  it('says so plainly when there is no bottleneck to report', () => {
    const message = buildContactMessage({
      answers,
      score: 100,
      band: 'Crescimento em loop',
      bottlenecks: [],
    })

    expect(message).toContain('Nenhum gargalo')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/quiz-message.test.ts`
Expected: FAIL — `Failed to resolve import "./quiz-message"`.

- [ ] **Step 3: Write `lib/quiz-message.ts`**

```ts
import { contextQuestion, goalQuestion } from '@/lib/quiz-questions'
import type { PhaseResult } from '@/lib/quiz-score'

/**
 * What the contact dialog opens pre-filled with. A lead that arrives carrying
 * its own diagnosis is worth answering differently from one that says only
 * "quero conversar" — and the visitor can edit every word before sending.
 */
export function buildContactMessage({
  answers,
  score,
  band,
  bottlenecks,
}: {
  answers: readonly number[]
  score: number
  band: string
  bottlenecks: readonly PhaseResult[]
}): string {
  const stage = contextQuestion.options[answers[0]]
  const goal = goalQuestion.options[answers[1]]

  const gaps = bottlenecks.length
    ? `Meus gargalos:\n${bottlenecks
        .map((result) => `- ${result.name} (${result.score} pts)`)
        .join('\n')}`
    : 'Nenhum gargalo apareceu abaixo de 66 pontos.'

  return [
    `Fiz o diagnóstico de growth e tirei ${score}/100 (${band}).`,
    `Estágio: ${stage}`,
    `Meta: ${goal}`,
    gaps,
    'Quero me aprofundar nisso.',
  ].join('\n\n')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/quiz-message.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/quiz-message.ts lib/quiz-message.test.ts
git commit -m "feat: turn a quiz result into a contact message"
```

---

## Task 5: The gauge

**Files:**
- Create: `lib/use-armed.ts`
- Create: `components/quiz-gauge.tsx`
- Test: `components/quiz-gauge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-gauge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { GAUGE_CIRCUMFERENCE, QuizGauge } from './quiz-gauge'
import { quizGaugeLabel } from '@/lib/quiz'
import { MIN_SCORE_OPACITY } from '@/lib/quiz-score'

describe('QuizGauge', () => {
  it('names the score for assistive technology', () => {
    render(<QuizGauge score={72} />)

    expect(
      screen.getByRole('img', { name: quizGaugeLabel(72) })
    ).toBeInTheDocument()
  })

  it('prints the number as text too, not only as a ring', () => {
    render(<QuizGauge score={72} />)

    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('draws the ring in proportion to the score', async () => {
    render(<QuizGauge score={50} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-gauge-fill')).toHaveAttribute(
        'stroke-dashoffset',
        String(GAUGE_CIRCUMFERENCE / 2)
      )
    )
  })

  it('closes the ring completely at 100', async () => {
    render(<QuizGauge score={100} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-gauge-fill')).toHaveAttribute(
        'stroke-dashoffset',
        '0'
      )
    )
  })

  it('keeps a weak score visible instead of turning it red', () => {
    render(<QuizGauge score={0} />)

    const ring = screen.getByTestId('quiz-gauge-fill')
    expect(ring.getAttribute('class')).toContain('stroke-lime')
    expect(Number(ring.getAttribute('stroke-opacity'))).toBe(MIN_SCORE_OPACITY)
  })

  it('holds still for anyone who asked for less motion', () => {
    render(<QuizGauge score={50} />)

    expect(screen.getByTestId('quiz-gauge-fill').getAttribute('class')).toContain(
      'motion-reduce:transition-none'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-gauge.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-gauge"`.

- [ ] **Step 3: Write `lib/use-armed.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

/**
 * False on the first paint, true from the next frame.
 *
 * A CSS transition only runs if the browser painted the start state first.
 * The gauge and the bars mount as part of a state transition — the visitor
 * answering the last question — and React can commit that mount and its
 * effects inside a single frame, which paints them already full. One
 * `requestAnimationFrame` guarantees the empty state is on screen first.
 */
export function useArmed(): boolean {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return armed
}
```

- [ ] **Step 4: Write `components/quiz-gauge.tsx`**

```tsx
'use client'

import { quizGaugeLabel, quizScaleLabel } from '@/lib/quiz'
import { scoreOpacity } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

const RADIUS = 64

/** Rounded so the dash offsets land on whole numbers. */
export const GAUGE_CIRCUMFERENCE = Math.round(2 * Math.PI * RADIUS)

/**
 * `role="img"` with the score in the label: the ring is one shape and reads as
 * one thing, and everything inside it is decoration repeating what the label
 * already says.
 */
export function QuizGauge({ score }: { score: number }) {
  const armed = useArmed()
  const offset = armed ? GAUGE_CIRCUMFERENCE * (1 - score / 100) : GAUGE_CIRCUMFERENCE

  return (
    <div
      role="img"
      aria-label={quizGaugeLabel(score)}
      className="relative h-36 w-36 shrink-0 md:h-40 md:w-40"
    >
      <svg viewBox="0 0 150 150" aria-hidden="true" className="h-full w-full -rotate-90">
        <circle
          cx="75"
          cy="75"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className="stroke-alabaster/10"
        />
        <circle
          data-testid="quiz-gauge-fill"
          cx="75"
          cy="75"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeOpacity={scoreOpacity(score)}
          className="stroke-lime transition-[stroke-dashoffset] duration-deliberate ease-out-expo motion-reduce:transition-none"
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-heading text-4xl font-black leading-none text-lime">
          {score}
        </span>
        <span className="mt-1 font-body text-xs text-platinum-gray">
          {quizScaleLabel}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run components/quiz-gauge.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/use-armed.ts components/quiz-gauge.tsx components/quiz-gauge.test.tsx
git commit -m "feat: draw the growth score as a lime gauge"
```

---

## Task 6: The phase bars

**Files:**
- Create: `components/quiz-phase-bars.tsx`
- Test: `components/quiz-phase-bars.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-phase-bars.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QuizPhaseBars } from './quiz-phase-bars'
import { phaseResults } from '@/lib/quiz-score'
import { phases } from '@/lib/quiz-questions'

const results = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])

describe('QuizPhaseBars', () => {
  it('names every phase', () => {
    render(<QuizPhaseBars results={results} />)

    for (const phase of phases) {
      expect(screen.getByText(phase.name)).toBeInTheDocument()
    }
  })

  it('prints the number beside each bar, not only the fill', () => {
    render(<QuizPhaseBars results={results} />)

    // Opacity and length are both easy to misread; the figure is not.
    expect(screen.getAllByText('100').length).toBeGreaterThan(0)
    expect(screen.getAllByText('33').length).toBeGreaterThan(0)
  })

  it('grows each bar to its score', async () => {
    render(<QuizPhaseBars results={results} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-bar-3')).toHaveStyle({ width: '100%' })
    )
    expect(screen.getByTestId('quiz-bar-0')).toHaveStyle({ width: '0%' })
  })

  it('stays lime at every score', () => {
    render(<QuizPhaseBars results={results} />)

    const weakest = screen.getByTestId('quiz-bar-0')
    expect(weakest.className).toContain('bg-lime')
    expect(weakest.className).toContain('motion-reduce:transition-none')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-phase-bars.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-phase-bars"`.

- [ ] **Step 3: Write `components/quiz-phase-bars.tsx`**

```tsx
'use client'

import type { PhaseResult } from '@/lib/quiz-score'
import { scoreOpacity } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

export function QuizPhaseBars({ results }: { results: readonly PhaseResult[] }) {
  const armed = useArmed()

  return (
    <ul className="flex flex-col gap-3">
      {results.map((result, index) => (
        <li key={result.name} className="flex items-center gap-3 md:gap-4">
          <span className="w-28 shrink-0 font-body text-xs text-platinum-gray md:w-52 md:text-sm">
            {result.name}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-alabaster/10">
            {/* Width and opacity are runtime values, so they cannot be
                Tailwind classes — the scanner only sees literals. */}
            <span
              data-testid={`quiz-bar-${index}`}
              style={{
                width: armed ? `${result.score}%` : '0%',
                opacity: scoreOpacity(result.score),
              }}
              className="block h-full rounded-full bg-lime transition-[width] duration-deliberate ease-out-expo motion-reduce:transition-none"
            />
          </span>
          <span className="w-8 shrink-0 text-right font-body text-xs text-platinum-gray">
            {result.score}
          </span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-phase-bars.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-phase-bars.tsx components/quiz-phase-bars.test.tsx
git commit -m "feat: chart the nine phase scores as bars"
```

---

## Task 7: The insight card

**Files:**
- Create: `components/quiz-insight-card.tsx`
- Test: `components/quiz-insight-card.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-insight-card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizInsightCard } from './quiz-insight-card'
import { phaseResults } from '@/lib/quiz-score'
import { quizActionLabel, quizPointsLabel, quizWhyLabel } from '@/lib/quiz'

const result = phaseResults([0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0])[0]

describe('QuizInsightCard', () => {
  it('titles the card with the phase and its score', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    expect(
      screen.getByRole('heading', { level: 3, name: result.name })
    ).toBeInTheDocument()
    expect(screen.getByText(quizPointsLabel(100))).toBeInTheDocument()
  })

  it('explains why the phase matters', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    expect(screen.getByText(quizWhyLabel)).toBeInTheDocument()
    expect(screen.getByText(result.principle)).toBeInTheDocument()
  })

  it('withholds the next step from a strength', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    // The action is remedial copy. On something that already works it reads
    // as a correction the visitor did not earn.
    expect(screen.queryByText(quizActionLabel)).toBeNull()
    expect(screen.queryByText(result.action)).toBeNull()
  })

  it('gives a bottleneck its next step', () => {
    render(<QuizInsightCard result={result} tone="bottleneck" />)

    expect(screen.getByText(quizActionLabel)).toBeInTheDocument()
    expect(screen.getByText(result.action)).toBeInTheDocument()
  })

  it('marks a bottleneck with the lime edge', () => {
    const { container } = render(
      <QuizInsightCard result={result} tone="bottleneck" />
    )

    expect(container.querySelector('[data-spotlight-card]')?.className).toContain(
      'border-lime/40'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-insight-card.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-insight-card"`.

- [ ] **Step 3: Write `components/quiz-insight-card.tsx`**

```tsx
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { quizActionLabel, quizPointsLabel, quizWhyLabel } from '@/lib/quiz'
import type { PhaseResult } from '@/lib/quiz-score'

/**
 * One phase, framed either way. A strength gets the principle only: the action
 * copy is remedial, and printing it under something that already works reads
 * as a correction rather than a confirmation.
 *
 * Full class literals per tone rather than an interpolated string — Tailwind's
 * scanner cannot resolve names built at runtime.
 */
const tones = {
  strength: 'border-alabaster/10',
  bottleneck: 'border-lime/40',
} as const

export function QuizInsightCard({
  result,
  tone,
}: {
  result: PhaseResult
  tone: keyof typeof tones
}) {
  return (
    <SpotlightCard
      className={`flex h-full flex-col gap-3 rounded-2xl border bg-alabaster/5 p-6 ${tones[tone]}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-lg font-black text-alabaster">
          {result.name}
        </h3>
        <span className="shrink-0 font-body text-xs tracking-[0.02em] text-platinum-gray">
          {quizPointsLabel(result.score)}
        </span>
      </div>

      <p className="font-body text-sm text-platinum-gray">
        <strong className="font-medium text-alabaster">{quizWhyLabel}</strong>{' '}
        {result.principle}
      </p>

      {tone === 'bottleneck' && (
        <div className="mt-auto border-l-2 border-lime bg-lime/5 px-4 py-3">
          <span className="block font-body text-[10px] font-medium uppercase tracking-[0.08em] text-lime">
            {quizActionLabel}
          </span>
          <p className="mt-1 font-body text-sm text-alabaster">{result.action}</p>
        </div>
      )}
    </SpotlightCard>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-insight-card.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-insight-card.tsx components/quiz-insight-card.test.tsx
git commit -m "feat: add the strength and bottleneck card"
```

---

## Task 8: A contact dialog that can open pre-filled

**Files:**
- Modify: `components/contact-dialog-provider.tsx`
- Modify: `components/contact-trigger.tsx`
- Modify: `components/contact-dialog.tsx`
- Test: `components/contact-dialog.test.tsx` (append)

- [ ] **Step 1: Write the failing test**

Append to the end of `components/contact-dialog.test.tsx`:

```tsx
describe('ContactDialog prefill', () => {
  function renderWithPrefill(message?: string) {
    return render(
      <ContactDialogProvider>
        <ContactTrigger message={message}>Falar com a Norn</ContactTrigger>
      </ContactDialogProvider>
    )
  }

  it('starts the message field from the prefill the trigger carries', async () => {
    const user = userEvent.setup()
    renderWithPrefill('Tirei 55/100 no diagnóstico.')

    await user.click(screen.getByRole('button', { name: 'Falar com a Norn' }))

    expect(screen.getByLabelText(contactMessageQuestion)).toHaveValue(
      'Tirei 55/100 no diagnóstico.'
    )
  })

  it('leaves the prefilled message editable', async () => {
    const user = userEvent.setup()
    renderWithPrefill('Tirei 55/100.')

    await user.click(screen.getByRole('button', { name: 'Falar com a Norn' }))
    await user.type(screen.getByLabelText(contactMessageQuestion), ' Quero ajuda.')

    expect(screen.getByLabelText(contactMessageQuestion)).toHaveValue(
      'Tirei 55/100. Quero ajuda.'
    )
  })

  it('still opens empty for a trigger that carries nothing', async () => {
    const user = userEvent.setup()
    renderWithPrefill()

    await user.click(screen.getByRole('button', { name: 'Falar com a Norn' }))

    // The hero and the CTA section pass no message; their behaviour must not
    // change.
    expect(screen.getByLabelText(contactMessageQuestion)).toHaveValue('')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/contact-dialog.test.tsx`
Expected: FAIL — TypeScript rejects the `message` prop on `ContactTrigger`, and
the prefill assertions fail with an empty textarea.

- [ ] **Step 3: Update `components/contact-dialog-provider.tsx`**

Replace the context type, the hook's error message stays as it is, and the
provider body:

```tsx
export type ContactPrefill = {
  message?: string
}

type ContactDialogValue = {
  open: (prefill?: ContactPrefill) => void
  /**
   * What the form should start from. Read once, when the form mounts — which
   * is every time the dialog opens, because Base UI unmounts the portal
   * subtree on close.
   */
  prefill: ContactPrefill
}
```

and inside `ContactDialogProvider`:

```tsx
  const [isOpen, setIsOpen] = useState(false)
  const [prefill, setPrefill] = useState<ContactPrefill>({})

  const open = useCallback((next: ContactPrefill = {}) => {
    setPrefill(next)
    setIsOpen(true)
  }, [])

  const value = useMemo(() => ({ open, prefill }), [open, prefill])
```

- [ ] **Step 4: Update `components/contact-trigger.tsx`**

```tsx
'use client'

import type { ReactNode } from 'react'
import { useContactDialog } from '@/components/contact-dialog-provider'

/**
 * A button, not a link: it opens a dialog rather than navigating anywhere.
 * Styling comes from the caller so the hero's outlined pill and the CTA
 * section's solid block can share one behaviour.
 *
 * `message` seeds the form. The quiz passes its result; every other caller
 * passes nothing and gets an empty form, as before.
 */
export function ContactTrigger({
  children,
  className = '',
  message,
}: {
  children: ReactNode
  className?: string
  message?: string
}) {
  const { open } = useContactDialog()

  return (
    <button type="button" onClick={() => open({ message })} className={className}>
      {children}
    </button>
  )
}
```

- [ ] **Step 5: Update `components/contact-dialog.tsx`**

Import the hook alongside the existing imports:

```tsx
import { useContactDialog } from '@/components/contact-dialog-provider'
```

and replace the first lines of `ContactDialogBody`'s state with:

```tsx
  const { prefill } = useContactDialog()

  // Initial state only: re-reading the prefill on every render would fight the
  // visitor for the field. A later opening mounts this component again, which
  // is when a new prefill takes effect.
  const [values, setValues] = useState<ContactValues>({
    ...EMPTY,
    message: prefill.message ?? '',
  })
```

- [ ] **Step 6: Run the whole contact suite to verify nothing regressed**

Run: `npx vitest run components/contact-dialog.test.tsx components/cta-section.test.tsx components/hero-section.test.tsx`
Expected: PASS — the three new cases plus every existing one.

- [ ] **Step 7: Commit**

```bash
git add components/contact-dialog-provider.tsx components/contact-trigger.tsx components/contact-dialog.tsx components/contact-dialog.test.tsx
git commit -m "feat: let a trigger open the contact dialog pre-filled"
```

---

## Task 9: The share button

**Files:**
- Create: `components/quiz-share-button.tsx`
- Test: `components/quiz-share-button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-share-button.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizShareButton } from './quiz-share-button'
import { quizShareCopied, quizShareLabel, quizShareManual } from '@/lib/quiz'
import { encodeAnswers } from '@/lib/quiz-share'

const answers = [3, 4, 0, 1, 2, 3, 0, 1, 2, 3, 0]

// The refusal case replaces `writeText`; without this it stays replaced for
// whatever runs next.
afterEach(() => {
  vi.restoreAllMocks()
})

describe('QuizShareButton', () => {
  it('copies a link that carries the answers', async () => {
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(await navigator.clipboard.readText()).toContain(
      `r=${encodeAnswers(answers)}`
    )
  })

  it('confirms the copy where a screen reader will hear it', async () => {
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(await screen.findByRole('status')).toHaveTextContent(quizShareCopied)
  })

  it('shows the link to copy by hand when the clipboard refuses', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied')
    )
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    // Clipboard access needs a secure context and can be refused outright;
    // without this the button would fail silently.
    expect(await screen.findByText(quizShareManual)).toBeInTheDocument()
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toContain(
      `r=${encodeAnswers(answers)}`
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-share-button.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-share-button"`.

- [ ] **Step 3: Write `components/quiz-share-button.tsx`**

```tsx
'use client'

import { useState } from 'react'
import {
  quizShareCopied,
  quizShareLabel,
  quizShareManual,
} from '@/lib/quiz'
import { buildShareUrl } from '@/lib/quiz-share'

export function QuizShareButton({ answers }: { answers: readonly number[] }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [link, setLink] = useState('')

  async function copy() {
    const url = buildShareUrl(answers)
    setLink(url)

    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      // The Clipboard API needs a secure context and can be refused outright.
      // Showing the link is the fallback that always works.
      setStatus('manual')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={copy}
        className="focus-ring w-fit rounded-full border border-alabaster/15 px-6 py-3.5 font-body text-sm font-medium text-alabaster transition-colors duration-instant hover:border-platinum-gray motion-reduce:transition-none"
      >
        {quizShareLabel}
      </button>

      {status === 'copied' && (
        <p role="status" className="font-body text-xs text-lime">
          {quizShareCopied}
        </p>
      )}

      {status === 'manual' && (
        <div role="status" className="flex flex-col gap-1">
          <span className="font-body text-xs text-platinum-gray">
            {quizShareManual}
          </span>
          <input
            readOnly
            value={link}
            aria-label={quizShareLabel}
            onFocus={(event) => event.currentTarget.select()}
            className="focus-ring w-full rounded-lg border border-alabaster/15 bg-alabaster/5 px-3 py-2 font-body text-xs text-alabaster"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-share-button.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-share-button.tsx components/quiz-share-button.test.tsx
git commit -m "feat: copy the result link, with a fallback when the clipboard refuses"
```

---

## Task 10: The result screen

**Files:**
- Create: `components/quiz-result.tsx`
- Test: `components/quiz-result.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-result.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizResult } from './quiz-result'
import { ContactDialogProvider } from './contact-dialog-provider'
import { contextQuestion, goalQuestion, phases } from '@/lib/quiz-questions'
import { bandFor, highlights, phaseResults, totalScore } from '@/lib/quiz-score'
import {
  quizContextLine,
  quizGaugeLabel,
  quizNoBottlenecksMessage,
  quizNoStrengthsMessage,
  quizRestartLabel,
  quizTalkLabel,
} from '@/lib/quiz'
import { contactMessageQuestion } from '@/lib/contact'

const perfect = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3]
const bleak = [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function renderResult(answers: number[], onRestart = vi.fn()) {
  render(
    <ContactDialogProvider>
      <QuizResult answers={answers} onRestart={onRestart} />
    </ContactDialogProvider>
  )
  return onRestart
}

describe('QuizResult', () => {
  it('leads with the band as the page heading', () => {
    renderResult(perfect)

    const band = bandFor(totalScore(phaseResults(perfect)))
    expect(
      screen.getByRole('heading', { level: 1, name: band.name })
    ).toBeInTheDocument()
    expect(screen.getByText(band.description)).toBeInTheDocument()
  })

  it('shows the score on the gauge', () => {
    renderResult(perfect)

    expect(
      screen.getByRole('img', { name: quizGaugeLabel(100) })
    ).toBeInTheDocument()
  })

  it('echoes the stage and goal the visitor chose', () => {
    renderResult(bleak)

    expect(
      screen.getByText(
        quizContextLine(contextQuestion.options[1], goalQuestion.options[2])
      )
    ).toBeInTheDocument()
  })

  it('charts all nine phases', () => {
    renderResult(bleak)

    for (const phase of phases) {
      expect(screen.getAllByText(phase.name).length).toBeGreaterThan(0)
    }
  })

  it('says plainly when there is no bottleneck to show', () => {
    renderResult(perfect)

    expect(highlights(phaseResults(perfect)).bottlenecks).toEqual([])
    expect(screen.getByText(quizNoBottlenecksMessage)).toBeInTheDocument()
  })

  it('says plainly when there is no strength to show', () => {
    renderResult(bleak)

    expect(highlights(phaseResults(bleak)).strengths).toEqual([])
    expect(screen.getByText(quizNoStrengthsMessage)).toBeInTheDocument()
  })

  it('opens the contact dialog carrying the result', async () => {
    const user = userEvent.setup()
    renderResult(bleak)

    await user.click(screen.getByRole('button', { name: quizTalkLabel }))

    expect(
      (screen.getByLabelText(contactMessageQuestion) as HTMLTextAreaElement)
        .value
    ).toContain('0/100')
  })

  it('hands the restart back to its caller', async () => {
    const user = userEvent.setup()
    const onRestart = renderResult(bleak)

    await user.click(screen.getByRole('button', { name: quizRestartLabel }))

    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('catches focus on the heading, since the question that had it is gone', () => {
    renderResult(perfect)

    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 1 })
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-result.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-result"`.

- [ ] **Step 3: Write `components/quiz-result.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { ContactTrigger } from '@/components/contact-trigger'
import { QuizGauge } from '@/components/quiz-gauge'
import { QuizInsightCard } from '@/components/quiz-insight-card'
import { QuizPhaseBars } from '@/components/quiz-phase-bars'
import { QuizShareButton } from '@/components/quiz-share-button'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import { SpotlightGroup } from '@/components/ui/spotlight-card'
import {
  quizBottlenecksHeading,
  quizContextLine,
  quizCtaBody,
  quizCtaTitle,
  quizNoBottlenecksMessage,
  quizNoStrengthsMessage,
  quizProfileHeading,
  quizRestartLabel,
  quizResultEyebrow,
  quizStrengthsHeading,
  quizTalkLabel,
} from '@/lib/quiz'
import { buildContactMessage } from '@/lib/quiz-message'
import { contextQuestion, goalQuestion } from '@/lib/quiz-questions'
import { bandFor, highlights, phaseResults, totalScore } from '@/lib/quiz-score'

const sectionHeadingClass =
  'font-heading text-sm font-black uppercase tracking-[0.1em] text-platinum-gray'

export function QuizResult({
  answers,
  onRestart,
}: {
  answers: readonly number[]
  onRestart: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The option button that held focus was unmounted with the last question
    // and nothing else catches it, so focus falls to <body>: the next Tab
    // starts from the top of the document and a screen reader never hears that
    // the result arrived.
    headingRef.current?.focus()
  }, [])

  const results = phaseResults(answers)
  const score = totalScore(results)
  const band = bandFor(score)
  const { strengths, bottlenecks } = highlights(results)

  const message = buildContactMessage(answers)

  return (
    <div className="flex flex-col gap-12">
      <SectionEyebrow>{quizResultEyebrow}</SectionEyebrow>

      <div className="rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <QuizGauge score={score} />
          <div className="min-w-56 flex-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-heading text-2xl font-black leading-tight text-alabaster focus:outline-none md:text-3xl"
            >
              {band.name}
            </h1>
            <p className="mt-3 max-w-lg font-body text-sm text-platinum-gray">
              {band.description}
            </p>
          </div>
        </div>
        <p className="mt-8 font-body text-xs text-platinum-gray">
          {quizContextLine(
            contextQuestion.options[answers[0]],
            goalQuestion.options[answers[1]]
          )}
        </p>
      </div>

      <section className="flex flex-col gap-5">
        <h2 className={sectionHeadingClass}>{quizProfileHeading}</h2>
        <QuizPhaseBars results={results} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className={sectionHeadingClass}>{quizStrengthsHeading}</h2>
        {strengths.length > 0 ? (
          <SpotlightGroup className="grid gap-4 md:grid-cols-2">
            {strengths.map((result) => (
              <QuizInsightCard key={result.name} result={result} tone="strength" />
            ))}
          </SpotlightGroup>
        ) : (
          <p className="font-body text-sm text-platinum-gray">
            {quizNoStrengthsMessage}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className={sectionHeadingClass}>{quizBottlenecksHeading}</h2>
        {bottlenecks.length > 0 ? (
          <SpotlightGroup className="grid gap-4">
            {bottlenecks.map((result) => (
              <QuizInsightCard
                key={result.name}
                result={result}
                tone="bottleneck"
              />
            ))}
          </SpotlightGroup>
        ) : (
          <p className="font-body text-sm text-platinum-gray">
            {quizNoBottlenecksMessage}
          </p>
        )}
      </section>

      <div className="rounded-2xl border border-lime/40 bg-alabaster/5 p-6 md:p-8">
        <p className="font-heading text-xl font-black leading-tight text-alabaster md:text-2xl">
          {quizCtaTitle}
        </p>
        <p className="mt-4 max-w-xl font-body text-sm text-platinum-gray">
          {quizCtaBody}
        </p>
        <div className="mt-7 flex flex-wrap items-start gap-3">
          <ContactTrigger
            message={message}
            className="focus-ring w-fit rounded-full bg-lime px-7 py-3.5 font-heading text-base font-black text-carbon-black transition-colors duration-instant hover:bg-lime/90 motion-reduce:transition-none"
          >
            {quizTalkLabel}
          </ContactTrigger>
          <QuizShareButton answers={answers} />
          <button
            type="button"
            onClick={onRestart}
            className="focus-ring w-fit rounded-full border border-alabaster/15 px-6 py-3.5 font-body text-sm font-medium text-alabaster transition-colors duration-instant hover:border-platinum-gray motion-reduce:transition-none"
          >
            {quizRestartLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-result.test.tsx`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-result.tsx components/quiz-result.test.tsx
git commit -m "feat: assemble the quiz result screen"
```

---

## Task 11: The intro screen

**Files:**
- Create: `components/quiz-intro.tsx`
- Test: `components/quiz-intro.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-intro.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizIntro } from './quiz-intro'
import {
  quizFinePrint,
  quizIntroBullets,
  quizIntroHeadline,
  quizIntroHeadlineEmphasis,
  quizStartLabel,
} from '@/lib/quiz'

describe('QuizIntro', () => {
  it('asks the question the page is named after', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(quizIntroHeadline)
    expect(heading).toHaveTextContent(quizIntroHeadlineEmphasis)
  })

  it('lists what the visitor gets at the end', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    for (const bullet of quizIntroBullets) {
      expect(screen.getByText(bullet)).toBeInTheDocument()
    }
  })

  it('keeps the no-signup promise in view', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    expect(screen.getByText(quizFinePrint)).toBeInTheDocument()
  })

  it('starts the quiz from the button', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<QuizIntro onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: quizStartLabel }))

    expect(onStart).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-intro.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-intro"`.

- [ ] **Step 3: Write `components/quiz-intro.tsx`**

```tsx
import { ArrowRight } from 'lucide-react'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import {
  quizFinePrint,
  quizIntroBullets,
  quizIntroClosing,
  quizIntroEyebrow,
  quizIntroHeadline,
  quizIntroHeadlineEmphasis,
  quizIntroHow,
  quizIntroLede,
  quizIntroPromise,
  quizStartLabel,
} from '@/lib/quiz'

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SectionEyebrow>{quizIntroEyebrow}</SectionEyebrow>

      <h1 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-5xl">
        {quizIntroHeadline}{' '}
        <span className="text-lime">{quizIntroHeadlineEmphasis}</span>
      </h1>

      <p className="font-body text-base text-platinum-gray">{quizIntroLede}</p>
      <p className="font-body text-base text-platinum-gray">{quizIntroHow}</p>
      <p className="font-body text-base text-platinum-gray">{quizIntroPromise}</p>

      <ul className="flex flex-col gap-3">
        {quizIntroBullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-3 font-body text-sm text-platinum-gray"
          >
            <span aria-hidden="true" className="shrink-0 text-lime">
              →
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <p className="font-body text-base text-alabaster">{quizIntroClosing}</p>

      <button
        type="button"
        onClick={onStart}
        className="focus-ring group flex w-fit items-center gap-3 rounded-full bg-lime px-8 py-4 font-heading text-lg font-black text-carbon-black transition-colors duration-instant hover:bg-lime/90 motion-reduce:transition-none"
      >
        {quizStartLabel}
        <ArrowRight
          className="h-5 w-5 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>

      <p className="font-body text-xs text-platinum-gray">{quizFinePrint}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-intro.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-intro.tsx components/quiz-intro.test.tsx
git commit -m "feat: add the quiz intro screen"
```

---

## Task 12: The question screen

**Files:**
- Create: `components/quiz-question.tsx`
- Test: `components/quiz-question.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-question.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizQuestion } from './quiz-question'
import { phases } from '@/lib/quiz-questions'
import { quizBackLabel } from '@/lib/quiz'

const phase = phases[0]

function renderQuestion(
  overrides: Partial<Parameters<typeof QuizQuestion>[0]> = {}
) {
  const props = {
    tag: phase.tag,
    question: phase.question,
    options: phase.options,
    selected: null as number | null,
    position: 3,
    onAnswer: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  }
  render(<QuizQuestion {...props} />)
  return props
}

describe('QuizQuestion', () => {
  it('makes the question the page heading', () => {
    renderQuestion()

    expect(
      screen.getByRole('heading', { level: 1, name: phase.question })
    ).toBeInTheDocument()
  })

  it('offers every option as a button', () => {
    renderQuestion()

    for (const option of phase.options) {
      expect(screen.getByRole('button', { name: option })).toBeInTheDocument()
    }
  })

  it('answers with the option index', async () => {
    const user = userEvent.setup()
    const { onAnswer } = renderQuestion()

    await user.click(screen.getByRole('button', { name: phase.options[2] }))

    expect(onAnswer).toHaveBeenCalledWith(2)
  })

  it('marks the option already chosen, for anyone who came back', () => {
    renderQuestion({ selected: 1 })

    expect(screen.getByRole('button', { name: phase.options[1] })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: phase.options[0] })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('takes focus onto the question, since the pressed button is gone', () => {
    renderQuestion()

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('offers a way back', async () => {
    const user = userEvent.setup()
    const { onBack } = renderQuestion()

    await user.click(screen.getByRole('button', { name: quizBackLabel }))

    expect(onBack).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-question.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-question"`.

- [ ] **Step 3: Write `components/quiz-question.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { quizBackLabel } from '@/lib/quiz'

/**
 * Options are buttons rather than a radiogroup. Choosing one advances the
 * screen, and a radiogroup moves its selection with the arrow keys — so every
 * arrow press would advance the quiz. The semantics that look more correct
 * produce the wrong behaviour; `aria-pressed` is honest about what a click
 * does and Tab still walks them.
 */
export function QuizQuestion({
  tag,
  question,
  options,
  selected,
  position,
  onAnswer,
  onBack,
}: {
  tag: string
  question: string
  options: readonly string[]
  selected: number | null
  position: number
  onAnswer: (option: number) => void
  onBack: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The button that was just pressed no longer exists, so focus falls to
    // <body>: the next Tab starts from the top of the document and a screen
    // reader never hears the new question.
    headingRef.current?.focus()
  }, [position])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="font-body text-xs font-medium uppercase tracking-[0.1em] text-lime">
        {tag}
      </p>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-black leading-snug text-alabaster focus:outline-none md:text-4xl"
      >
        {question}
      </h1>

      <ul className="flex flex-col gap-3">
        {options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              aria-pressed={selected === index}
              onClick={() => onAnswer(index)}
              className={`focus-ring flex w-full items-center gap-4 rounded-2xl border p-5 text-left font-body text-sm text-alabaster transition-colors duration-instant motion-reduce:transition-none md:text-base ${
                selected === index
                  ? 'border-lime bg-lime/10'
                  : 'border-alabaster/10 bg-alabaster/5 hover:border-lime/50'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full border ${
                  selected === index
                    ? 'border-lime bg-lime'
                    : 'border-platinum-gray'
                }`}
              />
              {option}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onBack}
        className="focus-ring w-fit rounded-sm font-body text-sm text-platinum-gray transition-colors duration-instant hover:text-alabaster motion-reduce:transition-none"
      >
        {quizBackLabel}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-question.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-question.tsx components/quiz-question.test.tsx
git commit -m "feat: add the quiz question screen"
```

---

## Task 13: The experience

**Files:**
- Create: `components/quiz-experience.tsx`
- Test: `components/quiz-experience.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/quiz-experience.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizExperience } from './quiz-experience'
import { ContactDialogProvider } from './contact-dialog-provider'
import { QUESTION_COUNT, phases, questionAt } from '@/lib/quiz-questions'
import { bandFor, phaseResults, totalScore } from '@/lib/quiz-score'
import { encodeAnswers } from '@/lib/quiz-share'
import {
  quizIntroHeadline,
  quizPositionLabel,
  quizRestartLabel,
  quizStartLabel,
} from '@/lib/quiz'

const perfect = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3]

function renderQuiz() {
  return render(
    <ContactDialogProvider>
      <QuizExperience />
    </ContactDialogProvider>
  )
}

/** Answers every question with the strongest option it offers. */
async function answerEverything(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: quizStartLabel }))
  for (let index = 0; index < QUESTION_COUNT; index++) {
    const options = questionAt(index).options
    await user.click(
      screen.getByRole('button', { name: options[options.length - 1] })
    )
  }
}

beforeEach(() => {
  window.history.replaceState({}, '', '/quiz/')
})

describe('QuizExperience', () => {
  it('opens on the intro', () => {
    renderQuiz()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('walks every question and lands on the result', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerEverything(user)

    const band = bandFor(
      totalScore(phaseResults([0, 0, ...Array<number>(phases.length).fill(3)]))
    )
    expect(
      screen.getByRole('heading', { level: 1, name: band.name })
    ).toBeInTheDocument()
  })

  it('keeps the answer when the visitor goes back', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    const first = questionAt(0).options
    await user.click(screen.getByRole('button', { name: first[1] }))
    await user.click(screen.getByRole('button', { name: /voltar/ }))

    expect(screen.getByRole('button', { name: first[1] })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('goes back to the intro from the first question', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    await user.click(screen.getByRole('button', { name: /voltar/ }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('opens straight on the result for a shared link', () => {
    window.history.replaceState({}, '', `/quiz/?r=${encodeAnswers(perfect)}`)
    renderQuiz()

    expect(
      screen.getByRole('heading', { level: 1, name: bandFor(100).name })
    ).toBeInTheDocument()
  })

  it('falls back to the intro when the link is junk', () => {
    window.history.replaceState({}, '', '/quiz/?r=nonsense')
    renderQuiz()

    // A tampered link is not worth an interstitial; it just starts the quiz.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('clears the shared link when the visitor starts over', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', `/quiz/?r=${encodeAnswers(perfect)}`)
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizRestartLabel }))

    // Otherwise the next refresh throws them back onto someone else's result.
    expect(window.location.search).toBe('')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('tracks progress while questions are on screen', async () => {
    const user = userEvent.setup()
    renderQuiz()

    expect(screen.queryByRole('progressbar')).toBeNull()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    const first = questionAt(0).options
    await user.click(screen.getByRole('button', { name: first[0] }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '9')
  })

  it('keeps a permanent status region for the question position, empty until a question shows', async () => {
    const user = userEvent.setup()
    renderQuiz()

    // Mounted from first paint, unlike the question screen's own heading: on
    // the very first question there is no QuizQuestion instance yet to own
    // this text, so a region created there would already contain "Pergunta 1
    // de 11" at the moment it is inserted — not reliably announced.
    const status = screen.getByRole('status')
    expect(status.className).toContain('sr-only')
    expect(status).toHaveTextContent('')

    await user.click(screen.getByRole('button', { name: quizStartLabel }))

    expect(status).toHaveTextContent(quizPositionLabel(1, QUESTION_COUNT))
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/quiz-experience.test.tsx`
Expected: FAIL — `Failed to resolve import "./quiz-experience"`.

- [ ] **Step 3: Write `components/quiz-experience.tsx`**

```tsx
'use client'

import { useEffect, useReducer } from 'react'
import { QuizIntro } from '@/components/quiz-intro'
import { QuizQuestion } from '@/components/quiz-question'
import { QuizResult } from '@/components/quiz-result'
import { NornBadge } from '@/components/ui/norn-badge'
import { brandSignature } from '@/lib/footer'
import { quizChromeLabel, quizPositionLabel, quizProgressLabel } from '@/lib/quiz'
import { QUESTION_COUNT, questionAt } from '@/lib/quiz-questions'
import { isComplete } from '@/lib/quiz-score'
import { readSharedAnswers } from '@/lib/quiz-share'

type Screen = 'intro' | 'question' | 'result'

type State = {
  screen: Screen
  index: number
  answers: (number | null)[]
}

type Action =
  | { type: 'start' }
  | { type: 'answer'; option: number }
  | { type: 'back' }
  | { type: 'restart' }
  | { type: 'restore'; answers: number[] }

const initialState: State = {
  screen: 'intro',
  index: 0,
  answers: Array(QUESTION_COUNT).fill(null),
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, screen: 'question', index: 0 }

    case 'answer': {
      const answers = [...state.answers]
      answers[state.index] = action.option
      const wasLast = state.index === QUESTION_COUNT - 1

      return {
        screen: wasLast ? 'result' : 'question',
        index: wasLast ? state.index : state.index + 1,
        answers,
      }
    }

    case 'back':
      // From the first question, back means the intro — and the answers
      // survive it. Re-reading the premise should not cost the visitor their
      // place.
      return state.index === 0
        ? { ...state, screen: 'intro' }
        : { ...state, index: state.index - 1 }

    case 'restart':
      return { ...initialState, answers: Array(QUESTION_COUNT).fill(null) }

    case 'restore':
      return {
        screen: 'result',
        index: QUESTION_COUNT - 1,
        answers: action.answers,
      }
  }
}

export function QuizExperience() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    // In an effect rather than during render: the export is prerendered with
    // no query string, so reading `location` while rendering would be a
    // hydration mismatch.
    const shared = readSharedAnswers(window.location.search)
    if (shared) dispatch({ type: 'restore', answers: shared })
  }, [])

  function restart() {
    dispatch({ type: 'restart' })
    // A visitor who arrived on a shared link and chose to start over would be
    // thrown back onto someone else's result by the next refresh.
    window.history.replaceState(null, '', window.location.pathname)
  }

  const answered = state.answers.filter((answer) => answer !== null).length
  const progress =
    state.screen === 'result'
      ? 100
      : Math.round((answered / QUESTION_COUNT) * 100)

  const question = state.screen === 'question' ? questionAt(state.index) : null

  return (
    <div className="flex min-h-svh flex-col bg-carbon-black">
      <header className="border-b border-alabaster/10 px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <NornBadge />
          <span className="font-body text-xs font-medium tracking-[0.1em] text-platinum-gray">
            {quizChromeLabel}
          </span>
          {state.screen === 'question' && (
            <div
              role="progressbar"
              aria-label={quizProgressLabel}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="ml-auto h-1 w-20 overflow-hidden rounded-full bg-alabaster/10 md:w-56"
            >
              <span
                style={{ width: `${progress}%` }}
                className="block h-full rounded-full bg-lime transition-[width] duration-base ease-out-quad motion-reduce:transition-none"
              />
            </div>
          )}
        </div>

        {/* Permanently mounted, rather than owned by QuizQuestion: on the
            very first question there is no QuizQuestion instance yet to
            insert this text, so a live region created there would already
            contain "Pergunta 1 de 11" the moment it appears — a screen
            reader does not reliably announce a live region that arrives with
            content already inside it. Sitting here instead means only its
            text content ever changes, so every announcement fires, including
            the first. It is this bar's accessible twin: same information,
            silent and empty outside a question. */}
        <p role="status" className="sr-only">
          {state.screen === 'question'
            ? quizPositionLabel(state.index + 1, QUESTION_COUNT)
            : ''}
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:px-12 md:py-20">
        {state.screen === 'intro' && (
          <QuizIntro onStart={() => dispatch({ type: 'start' })} />
        )}

        {question && (
          <QuizQuestion
            tag={question.tag}
            question={question.question}
            options={question.options}
            selected={state.answers[state.index]}
            position={state.index + 1}
            onAnswer={(option) => dispatch({ type: 'answer', option })}
            onBack={() => dispatch({ type: 'back' })}
          />
        )}

        {state.screen === 'result' && isComplete(state.answers) && (
          <QuizResult answers={state.answers} onRestart={restart} />
        )}
      </main>

      <footer className="border-t border-alabaster/10 px-6 py-8 md:px-12">
        <p className="mx-auto max-w-3xl font-body text-xs tracking-[0.02em] text-platinum-gray">
          {brandSignature}
        </p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/quiz-experience.test.tsx`
Expected: PASS, 9 tests.

If the progress assertion fails on the rounding, check the arithmetic: one
answer out of eleven is `Math.round(9.09)` = `9`.

- [ ] **Step 5: Commit**

```bash
git add components/quiz-experience.tsx components/quiz-experience.test.tsx
git commit -m "feat: drive the quiz through one reducer"
```

---

## Task 14: The route

**Files:**
- Create: `app/quiz/page.tsx`
- Test: `app/quiz/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/quiz/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuizPage, { metadata } from './page'
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
import { quizIntroHeadline, quizPageDescription, quizPageTitle } from '@/lib/quiz'
import { siteName, siteUrl } from '@/lib/hero'

describe('QuizPage', () => {
  it('renders the quiz on its intro screen', () => {
    render(
      <ContactDialogProvider>
        <QuizPage />
      </ContactDialogProvider>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('titles and describes itself for search and for shares', () => {
    expect(metadata.title).toBe(`${quizPageTitle} — ${siteName}`)
    expect(metadata.description).toBe(quizPageDescription)
    expect(metadata.openGraph?.url).toBe(`${siteUrl}quiz/`)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run app/quiz/page.test.tsx`
Expected: FAIL — `Failed to resolve import "./page"`.

- [ ] **Step 3: Write `app/quiz/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { QuizExperience } from '@/components/quiz-experience'
import { siteName, siteUrl } from '@/lib/hero'
import { quizPageDescription, quizPageTitle } from '@/lib/quiz'

export const metadata: Metadata = {
  title: `${quizPageTitle} — ${siteName}`,
  description: quizPageDescription,
  openGraph: {
    title: `${quizPageTitle} — ${siteName}`,
    description: quizPageDescription,
    siteName,
    locale: 'pt_BR',
    type: 'website',
    url: `${siteUrl}quiz/`,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${quizPageTitle} — ${siteName}`,
    description: quizPageDescription,
  },
}

// The experience owns the whole frame — top bar, main and signature — because
// the progress track in the bar is quiz state. There is nothing left for the
// route to wrap it in.
export default function QuizPage() {
  return <QuizExperience />
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run app/quiz/page.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add app/quiz/page.tsx app/quiz/page.test.tsx
git commit -m "feat: serve the growth quiz at /quiz"
```

---

## Task 15: The way in

**Files:**
- Modify: `lib/footer.ts`
- Modify: `components/site-footer.tsx`
- Test: `components/site-footer.test.tsx` (append)

- [ ] **Step 1: Write the failing test**

Append to the `describe('SiteFooter', …)` block in
`components/site-footer.test.tsx`:

```tsx
  it('offers the growth diagnostic', () => {
    render(<SiteFooter />)

    const nav = screen.getByRole('navigation', { name: /rodapé/i })
    expect(within(nav).getByRole('link', { name: quizNavLabel })).toHaveAttribute(
      'href',
      '/quiz/'
    )
  })
```

and add the import at the top of the file:

```tsx
import { quizNavLabel } from '@/lib/quiz'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/site-footer.test.tsx`
Expected: FAIL — `Unable to find an accessible element with the role "link" and name "DIAGNÓSTICO"`.

- [ ] **Step 3: Add the link to `lib/footer.ts`**

Replace `footerLinks` with:

```ts
export const footerLinks: FooterLink[] = [
  { href: '#servicos', label: 'SERVIÇOS' },
  { href: '#como-fazemos', label: 'COMO FAZEMOS' },
  { href: '/quiz/', label: quizNavLabel },
  { href: '#contato', label: 'CONTATO' },
]
```

and add the import at the top:

```ts
import { quizNavLabel } from '@/lib/quiz'
```

- [ ] **Step 4: Teach `components/site-footer.tsx` to render route links**

Add the import:

```tsx
import Link from 'next/link'
```

Hoist the shared class to module scope, just below the imports:

```tsx
// One literal shared by both link kinds — Tailwind's scanner only sees
// literals, and two copies would drift.
const footerLinkClass =
  'focus-ring rounded-sm font-body text-xs font-medium tracking-[0.02em] text-platinum-gray transition-colors duration-instant hover:text-lime motion-reduce:transition-none'
```

and replace the `<li>` body inside the map with:

```tsx
              <li key={href}>
                {/* Deriving the kind from the href rather than adding a field
                    that could disagree with it. An in-page anchor must stay a
                    plain <a>; a route needs Link to avoid a full reload. */}
                {href.startsWith('#') ? (
                  <a href={href} className={footerLinkClass}>
                    {label}
                  </a>
                ) : (
                  <Link href={href} className={footerLinkClass}>
                    {label}
                  </Link>
                )}
              </li>
```

- [ ] **Step 5: Run the footer and home tests**

Run: `npx vitest run components/site-footer.test.tsx app/page.test.tsx`
Expected: PASS — the new case, the existing `renders every nav link with its
anchor` (it reads `footerLinks`, so it covers `/quiz/` automatically), and the
home page's in-page anchor integrity check, which only inspects `a[href^="#"]`.

- [ ] **Step 6: Commit**

```bash
git add lib/footer.ts components/site-footer.tsx components/site-footer.test.tsx
git commit -m "feat: link the growth diagnostic from the footer"
```

---

## Task 16: Verify the whole thing

**Files:** none — this task only runs commands.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: every file passes, including the pre-existing suites. If
`components/hero-section.test.tsx` or `app/page.test.tsx` fail, the footer
change is the suspect — check that the anchor links are still plain `<a>`.

- [ ] **Step 2: Lint**

Run: `npx eslint app components lib`
Expected: no errors. The two rules most likely to fire here are
`react/no-unescaped-entities` (a Portuguese string left in JSX) and
`react-hooks/static-components` (a component declared inside another).

**Not `npm run lint`.** That lints the whole working directory, which includes
`ds-bundle/` — the generated design-system bundle, complete with a vendored
copy of React. It is gitignored, but ESLint 9's flat config does not read
`.gitignore`, so it gets linted anyway and reports 22 pre-existing
`react-hooks/rules-of-hooks` errors from inside React's own reconciler. That
number is the baseline on this branch and on `master`; it has nothing to do
with the quiz. Linting the three source directories is the check that actually
means something here.

- [ ] **Step 3: Typecheck through the build**

Run: `npm run build`
Expected: the build completes and lists `/quiz` among the exported routes.

- [ ] **Step 4: Look at it**

Run: `npm run dev` and open `http://localhost:3000/quiz/`.

Check by hand, because no test covers appearance:
- the ring and the bars animate up from empty on arrival at the result;
- the bars read lime at every score, never red;
- Tab reaches every option and the focus ring is visible on the dark surface;
- copying the link and opening it in a new tab lands on the same result;
- "Falar com a Norn" opens the dialog with the message already written;
- the footer link on `/` reaches the quiz without a full reload.

- [ ] **Step 5: Commit anything the check turned up**

If steps 1–4 required no changes, there is nothing to commit and the branch is
ready. Otherwise commit the fixes with a message naming what was wrong.
