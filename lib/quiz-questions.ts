// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.
//
// This is the diagnostic's source of truth, and two other files depend on it
// staying put. `lib/quiz-score.ts` reads the option order — index 0 is always
// the weakest answer and index 3 the strongest — so reordering options here
// silently rewrites every score. And `lib/quiz-share.ts` encodes an answer as
// an option index per question, so adding, removing or reordering a question
// or its options here means bumping `FORMAT_VERSION` in that file too —
// otherwise a link shared under the old questions keeps decoding, onto
// answers its author never gave.

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

/**
 * The stage and goal a visitor chose, resolved from the two context answers.
 * `quiz-result.tsx`'s context line and `quiz-message.ts`'s contact prefill
 * both need this pair — one helper here means reordering or adding a context
 * question can only break both the same way, not silently swap the stage and
 * goal in one of them while leaving the other correct.
 *
 * Indexed with no fallback: `answers` is only ever complete and in-range when
 * either caller runs — the reducer in `quiz-experience.tsx` builds it one
 * in-range click at a time, and a shared link is range-validated by
 * `decodeAnswers` (`lib/quiz-share.ts`) before it reaches either.
 */
export function chosenStageAndGoal(answers: readonly number[]): {
  stage: string
  goal: string
} {
  return {
    stage: contextQuestion.options[answers[0]],
    goal: goalQuestion.options[answers[1]],
  }
}
