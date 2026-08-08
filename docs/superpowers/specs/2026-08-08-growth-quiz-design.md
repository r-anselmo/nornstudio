# Growth quiz — /quiz

Date: 2026-08-08

## Problem

Norn has a growth diagnostic — eleven questions that place a product somewhere
on the studio's nine-phase method — but it only exists as a standalone HTML
mock (`growth-quiz-norn.html`). The mock carries its own palette, its own
typography stack and its own components, none of which are Norn's: it uses
`#D8FF3E` where the brand lime is `#c6f432`, `#121210` where carbon-black is
`#1d1e18`, Cabinet Grotesk at weights 700 and 500 where the brand ships only
900, and 2px corners against a radius scale built on `--radius: 0.625rem`.

Shipped as-is it would read as a different studio's page. The job is to port
the diagnostic onto the site as a real route, rebuilt on the tokens and atoms
in `.design-sync/conventions.md`.

## Constraints

`next.config.ts` sets `output: "export"` with `trailingSlash: true` and a
`basePath` of `/nornstudio` under GitHub Actions. There is no server: all quiz
state, scoring and share-link handling runs in the browser, and any URL the
page builds for itself must be derived from `location` rather than hardcoded,
or it breaks under the deploy-time basePath.

`react/no-unescaped-entities` is error-level, so Portuguese copy with
apostrophes and quotes cannot live in JSX. Every string ships from a `lib/`
module, the pattern already set by `lib/tear.ts`, `lib/contact.ts` and
`lib/hero.ts`.

## Decisions taken

- **Fidelity:** same structure as the mock — intro, eleven questions one at a
  time, result screen — rebuilt entirely in Norn's tokens and atoms.
- **Sharing:** a copyable link (`?r=…`) instead of the mock's 1080×1080 canvas
  PNG. See "Why not the canvas card" below.
- **Final CTA:** opens the site's existing `ContactDialog` with the message
  field pre-filled from the result, rather than the mock's `mailto:`.
- **Entry point:** a link in `SiteFooter`. Not in the hero, which already
  carries two actions.
- **State:** `useReducer` inside one client component. The URL is read on mount
  and written only when the visitor asks for a link.

### Why not the canvas card

The mock draws its share image with `ctx.font = '700 76px "Cabinet Grotesk"'`.
On this site the brand fonts load through `next/font/local`, which mints a
hashed family name (`__cabinetGrotesk_xxxxx`) and exposes it only as a CSS
variable — so that literal silently falls back to a system font. Drawing it
correctly means waiting on `document.fonts.ready` and reading the computed
family off a probe element, and the card's fixed pixel layout still breaks on
the longer band names. A link costs a fraction of that and is testable without
pixel comparison.

The trade-off accepted: no per-result preview image when the link is pasted
into WhatsApp or LinkedIn. A static export cannot generate one per result
anyway — the site's single `/opengraph-image.png` is what would be shown either
way.

## Architecture

### Route

`app/quiz/page.tsx` — a server component holding only `metadata`, following
`app/tear/page.tsx`. It renders `<QuizExperience />` inside a
`min-h-svh bg-carbon-black` main.

Metadata: title `Diagnóstico de Growth — Norn — Growth Design`, description
`Descubra em poucos minutos o que está ajudando ou travando o crescimento do
seu produto. 11 perguntas, 3 minutos, sem cadastro.`, Open Graph and Twitter
cards pointing at the existing `/opengraph-image.png`, `url` built as
`${siteUrl}quiz/`.

### Chrome

A slim top bar: `NornBadge` plus the label `DIAGNÓSTICO DE GROWTH` on the left,
and on the right a 3px progress track that is present only while questions are
on screen. At the foot, a single line carrying `brandSignature` from
`lib/footer.ts`.

`SiteFooter` is deliberately not reused here. It is a four-block footer with
its own navigation; on a three-minute focused flow it is an invitation to
leave.

### The score colour

The mock interpolates every bar and the gauge ring from `#e0714f` (a soft red)
to its lime as the score rises. Norn has no red: the brand is lime,
carbon-black, alabaster and platinum-gray, and `--destructive` exists only in
the light-mode shadcn tokens the dark sections never use. Importing an orange
would be inventing a brand colour to render a number.

Instead the fill is always lime, and a low score is lime at reduced opacity —
`lime/40` at zero rising to full lime at 100, over the `carbon-black`/`alabaster/10`
track. Length already carries the value; opacity reinforces it without a second
hue. This also keeps the result honest in tone: the diagnostic's own copy says
there are no right or wrong answers, and a red bar says otherwise.

Because opacity alone is not a safe carrier of meaning, every bar prints its
numeric score beside it, exactly as the mock does.

### Modules

| File | Responsibility |
|---|---|
| `lib/quiz.ts` | Every string the page renders: intro copy, section labels, band names and descriptions, button labels, empty-state lines |
| `lib/quiz-questions.ts` | The eleven questions and their types — two unscored context questions plus nine scored phases carrying `tag`, `question`, `options`, `principle`, `action` |
| `lib/quiz-score.ts` | Pure scoring: per-phase score, total, band, strengths, bottlenecks |
| `lib/quiz-share.ts` | `encodeAnswers` / `decodeAnswers` for the `?r=` parameter |

### Components

`components/quiz-experience.tsx` (`'use client'`) is the only component holding
state. Everything below it is presentation and takes props:

- `quiz-intro.tsx` — headline, lede, the three bullets, start button
- `quiz-question.tsx` — one question, its options, the back control
- `quiz-result.tsx` — composes the result screen
- `quiz-gauge.tsx` — the animated SVG ring and score
- `quiz-phase-bars.tsx` — nine labelled bars
- `quiz-insight-card.tsx` — one card, used for both a strength and a
  bottleneck; the `action` block renders only for bottlenecks
- `quiz-share-button.tsx` — builds and copies the result link

### Data flow

```
app/quiz/page.tsx  (server, metadata only)
  └── QuizExperience  (client)
        state: { screen: 'intro' | 'question' | 'result', index, answers }
        actions: start | answer(optionIndex) | back | restart
        │
        ├── on mount: decodeAnswers(location.search) → valid ? screen='result'
        ├── QuizIntro         → dispatch(start)
        ├── QuizQuestion      → dispatch(answer) advances; last answer → result
        └── QuizResult        ← quiz-score.ts derives everything from answers
```

`answers` is `(number | null)[]` of length 11. Nothing is derived and stored:
score, band, strengths and bottlenecks are computed from `answers` on every
render by pure functions, so a shared link and a freshly-completed quiz cannot
disagree.

The `?r=` read happens in `useEffect`, not during render. The export is
prerendered without a query string, and reading `location` during render would
be a hydration mismatch.

`back` on the first question returns to the intro rather than doing nothing,
and answers already given survive it — someone who backs out to re-read the
premise should not lose their place.

`restart` clears the answers and also strips `?r=` from the address bar with
`history.replaceState`. Without that, a visitor who arrived on a shared link
and chose to redo the quiz would be thrown back to someone else's result by
the next refresh.

### Heading structure

One `h1` at a time, since only one screen is mounted: the headline on the
intro, the question itself on a question screen, and the band name on the
result. The top bar's label is not a heading — it is chrome.

## Scoring

Each phase option maps to `[0, 33, 66, 100]` by index. The final score is the
mean of the nine, rounded.

Bands:

| Score | Band | Description |
|---|---|---|
| 0–25 | Crescimento no escuro | Sem meta clara e sem motor identificado — as decisões ainda partem de vontade, não de direção. |
| 26–50 | Crescimento por sorte | Existe algum resultado, mas ele não é compreendido nem reproduzível — depende de continuar dando certo. |
| 51–75 | Crescimento com direção | Existe critério e processo, mas ainda falta estrutura que sustente o crescimento sem esforço manual constante. |
| 76–100 | Crescimento em loop | O motor está identificado, estruturado, e se sustenta com pouca intervenção — o trabalho agora é proteger e acelerar. |

**Strengths:** phases scoring 66 or more, highest first, at most two.

**Bottlenecks:** phases scoring 66 or less, lowest first, at most three,
excluding any phase already listed as a strength.

**Ties** break by phase order (00 → 08), so the ordering is deterministic and a
shared link always renders the same result.

### Three corrections to the mock

1. **A phase could appear as both a strength and a bottleneck.** The mock takes
   the top two and bottom three from independent sorts; with tied answers the
   sets overlap and the same card renders twice with opposite framing. The
   exclusion rule above fixes it.

2. **"Gargalos" cards showing 100 points.** With every answer at the top
   option, the mock still renders three bottleneck cards — each reading
   "100 pts" under a heading that says this is what is holding you back. The
   thresholds fix it, and a section with no candidates is not rendered at all;
   an honest line takes its place:
   - no strengths: `Nenhuma fase passou de 66 pontos ainda — o ponto de partida está nos gargalos abaixo.`
   - no bottlenecks: `Nenhuma fase ficou abaixo de 66 pontos. O trabalho agora é proteger o que já funciona.`

3. **The progress bar never reaches the last step.** The mock computes
   `current / total`, so the eleventh question displays 10/11. It counts
   answered questions instead, reaching 100% on the result screen.

A fourth, smaller fix: the mock's card label reads `Por quê isso importa` — in
Portuguese the interrogative inside a statement is `por que`. Corrected to
`Por que isso importa`.

## Share links

`encodeAnswers` produces `1` (a format version) followed by eleven digits, one
per question: `?r=103120321032`.

`decodeAnswers` returns `null` unless the string starts with the known version,
has exactly eleven digits after it, and each digit is inside its own question's
option range — question 2 offers five options, every other question four. A
`null` drops the visitor onto the intro with no error message; a tampered or
stale link is not worth an interstitial.

The version prefix exists so that changing a question later invalidates old
links instead of silently mapping them onto different answers.

The link is built from `location.origin + location.pathname`, never from
`siteUrl`, so it survives the `/nornstudio` basePath that GitHub Actions
applies at build time.

Copy uses `navigator.clipboard.writeText`. It requires a secure context and can
reject; on failure the button reveals the URL as selectable text so the visitor
can copy it by hand.

## Accessibility and motion

**Options are buttons, not radios.** Choosing advances the screen. A
`radiogroup` moves selection with the arrow keys, so every arrow press would
advance the quiz — the correct-looking semantics produce the wrong behaviour.
A list of buttons with `aria-pressed` on the previously chosen one is honest
about what a click does, and Tab still walks them.

**Focus and announcement.** Changing question moves focus to the question
heading (`tabIndex={-1}`) and a polite live region announces
`Pergunta 3 de 11`. Reaching the result moves focus to the result heading.

**The gauge** is `role="img"` with the score in its `aria-label`; the number is
also present as text, so the ring is decoration rather than the only carrier of
the value.

**Motion** uses the existing tokens — `duration-*`, `ease-out-quad`,
`ease-out-expo` — and `Reveal` for block entrances. The ring and the bars
animate from zero once, on mount of the result screen. Under
`prefers-reduced-motion` they paint at their final value with no transition.
Every interactive element carries `focus-ring`.

## Changes outside the quiz

### `ContactDialogProvider` accepts a prefill

`open()` becomes `open(prefill?: { message?: string })` and the provider holds
the value. `ContactTrigger` gains an optional `message` prop that it forwards.
`ContactDialogBody` reads the prefill from context when it mounts — which is
the right moment, because Base UI unmounts the portal subtree on close, so each
opening builds the form fresh.

Called with no argument the behaviour is unchanged, so the hero trigger and
`CtaSection` keep working exactly as they do now.

The quiz composes the prefilled message from the result: score and band, the
two context answers, and the bottleneck names. The visitor can edit it before
sending.

### `SiteFooter` links to the quiz

`footerLinks` gains `{ href: '/quiz/', label: 'DIAGNÓSTICO' }`. The existing
entries are in-page anchors; the footer renders `next/link` when an `href` does
not start with `#`, and a plain `<a>` when it does. Deriving the link type from
the href avoids a second field that could disagree with it.

## Testing

Pure modules carry the load, since they hold every rule:

- `lib/quiz-score.test.ts` — band boundaries at 25/26, 50/51 and 75/76; the
  all-zero and all-100 answer sets; strengths and bottlenecks never overlapping;
  tie ordering; the empty-section cases.
- `lib/quiz-share.test.ts` — encode/decode round trip; rejection of the wrong
  version, wrong length, a non-digit, and a digit outside a question's range.

Component tests use `userEvent`:

- `components/quiz-experience.test.tsx` — the full run from intro through
  eleven answers to the result; back preserving the previous answer; a valid
  `?r=` opening straight on the result; an invalid one landing on the intro.
- `components/quiz-gauge.test.tsx`, `quiz-phase-bars.test.tsx`,
  `quiz-insight-card.test.tsx` — labels, scores and ARIA.
- `components/site-footer.test.tsx` — the new link.
- `components/contact-dialog.test.tsx` — opening with and without a prefill.

## Out of scope

The canvas share image, `localStorage` persistence, analytics, and any
mandatory e-mail capture. The intro promises "sem e-mail, sem cadastro" and the
page keeps that promise.

## Appendix — content

The mock's file is mis-encoded (`Ã§`, `â`), so this is the corrected copy and
the source of truth for implementation.

### Intro

- Eyebrow: `Diagnóstico de Growth`
- Headline: `Seu produto está crescendo — ` + lime: `ou só está trabalhando mais?`
- `Descubra em poucos minutos o que está ajudando ou travando o crescimento do seu produto, negócio ou projeto.`
- `Responda 11 perguntas sobre como você trabalha hoje. Não existem respostas certas ou erradas — só um retrato mais honesto de onde você está. Leva cerca de 3 minutos.`
- `Ao final, você recebe:`
  - `Sua nota de Growth, de 0 a 100 — um termômetro de como você está crescendo hoje`
  - `Seus pontos fortes e gargalos — e o porquê de cada resultado`
  - `Ações práticas para evoluir — baseadas na metodologia da Norn`
- `Pronto para descobrir onde está o seu próximo gargalo?`
- Button: `Começar diagnóstico`
- Fine print: `Sem e-mail, sem cadastro. O resultado é seu, na hora.`

### Question 1 — context (unscored)

`Qual desses cenários descreve melhor onde vocês estão hoje?`

1. `Ainda não lançamos — estamos em ideação`
2. `Lançamos, mas ainda sem tração relevante`
3. `Temos tração, mas sem clareza de origem ou direção`
4. `Temos tração e direção, e queremos acelerar`

### Question 2 — goal (unscored, five options)

`Qual desses resultados mais representa o que você busca agora?`

1. `Ser conhecido — ter autoridade e reconhecimento no meu mercado`
2. `Ter um produto usado com frequência — engajamento e recorrência de uso`
3. `Ter uma renda recorrente e previsível`
4. `Crescer em número de clientes ou usuários`
5. `Expandir para novos mercados ou públicos`

Both feed the result's context line: `Estágio: … · Meta: …`

### Phase 00 · Qualificação do sintoma

`Quando vocês falam em crescer, dá pra traduzir isso numa meta específica e mensurável?`

1. `Não, é mais uma vontade geral de crescer`
2. `Sim, mas muda dependendo de quem pergunta`
3. `Sim, é clara, mas não é compartilhada por todo o time`
4. `Sim, é clara, mensurável, e todo mundo que decide conhece`

- Principle: `O que se pede sem número é sintoma, não meta — e nenhuma decisão boa se toma em cima de sintoma não qualificado.`
- Action: `Antes de qualquer ação, transformem a vontade de crescer em um número único, específico, conhecido por quem decide.`

### Phase 01 · De onde vem o motor

`Vocês sabem explicar de onde vem o crescimento (ou tração) que já existe hoje?`

1. `Ainda não temos crescimento ou tração`
2. `Temos, mas não sabemos explicar por quê`
3. `Temos uma hipótese, mas nunca confirmamos com dado`
4. `Sabemos exatamente de onde vem, e conseguimos reproduzir`

- Principle: `Tração sem explicação é sorte, não motor — e sorte não escala por decisão, só por acidente.`
- Action: `Mapeiem com dado — não achismo — qual canal, gatilho ou comportamento realmente gera o resultado que já existe.`

### Phase 02 · Diz, precisa, não sabe que precisa

`Como vocês decidem o que o usuário realmente precisa, antes de construir algo?`

1. `Construímos com base no que a gente acha que faz sentido`
2. `Perguntamos, e implementamos exatamente o que pedem`
3. `Conversamos com usuários, mas sem processo formal`
4. `Processo estruturado que separa o que pedem do que resolve o problema de fato`

- Principle: `O que o usuário pede é sintoma; o requisito de verdade só aparece quando alguém qualifica esse pedido.`
- Action: `Rodem entrevistas abertas — sem sugerir solução — com quem já usa o produto, antes do próximo ciclo.`

### Phase 03 · Importância × Viabilidade

`Como vocês priorizam entre várias oportunidades de crescimento possíveis?`

1. `Prioridade muda conforme quem pede por último ou grita mais alto`
2. `Por instinto ou experiência, sem critério formal`
3. `Temos critério (ex: impacto x esforço), mas nem sempre seguimos`
4. `Critério formal, seguido de forma consistente`

- Principle: `Sem critério explícito, prioridade vira política interna — a hipótese mais importante perde pra mais barulhenta.`
- Action: `Listem as oportunidades atuais e pontuem cada uma em importância x viabilidade antes da próxima decisão.`

### Phase 04 · Hipóteses no orçamento

`Antes de construir algo novo por completo, vocês testam uma versão mínima primeiro?`

1. `Não, construímos a versão completa direto`
2. `Às vezes, dependendo do projeto`
3. `Geralmente sim, mas sem critério claro de quando parar de testar`
4. `Sempre validamos com a menor versão possível antes de investir mais`

- Principle: `Toda hipótese não testada é uma aposta — o MVP existe pra pagar o preço do erro antes dele ficar caro.`
- Action: `Peguem a próxima hipótese da lista e definam, antes de começar, qual é a menor versão capaz de gerar sinal.`

### Phase 05 · Arquitetura de canais e loops

`O crescimento de vocês depende de esforço manual constante, ou existe estrutura que se sustenta sozinha?`

1. `Depende 100% de esforço manual ou mídia paga constante`
2. `Mistura de esforço manual com alguma estrutura, mas frágil`
3. `Existe estrutura, ainda com forte dependência de canais pagos`
4. `Existe estrutura de canais e loops que se sustenta com pouca intervenção`

- Principle: `Sem arquitetura, todo resultado exige repetir o esforço do zero — crescimento vira trabalho, não motor.`
- Action: `Mapeiem como uma ação do usuário hoje leva (ou não leva) à próxima, sem depender de vocês empurrarem.`

### Phase 06 · Caminho até o valor

`Vocês sabem quanto tempo (ou quantos passos) um novo usuário leva até sentir o valor real do produto?`

1. `Não sabemos medir isso`
2. `Sabemos que demora, mas nunca medimos exatamente`
3. `Medimos, mas o caminho ainda é longo ou tem fricção`
4. `Medimos, e o caminho é curto e direto`

- Principle: `Todo passo entre a entrada e o valor sentido é uma chance do usuário desistir antes de confiar.`
- Action: `Desenhem o caminho real — não o ideal — do primeiro clique até o primeiro valor sentido, e contem os passos.`

### Phase 07 · Instrumentação do experimento

`Quando testam algo novo, vocês definem o critério de sucesso antes de rodar o teste?`

1. `Não, avaliamos depois se parece que funcionou`
2. `Às vezes, mas de forma informal`
3. `Definimos, mas nem sempre seguimos à risca`
4. `Sempre definimos antes, e comparamos o resultado a isso`

- Principle: `Sem critério definido antes, todo resultado ambíguo vira confirmação do que já se queria acreditar.`
- Action: `No próximo teste, escrevam antes de rodar: o que conta como sucesso, e o que conta como sinal de que não funcionou.`

### Phase 08 · O motor de crescimento

`Os usuários que já usam o produto voltam e trazem outros, ou cada resultado novo depende de trazer gente nova?`

1. `Cada resultado depende inteiramente de trazer gente nova`
2. `Alguns voltam, mas não sabemos por quê nem como reforçar isso`
3. `Existe retenção ou indicação, mas não é intencional`
4. `Existe um loop claro de retorno e indicação que se reforça sozinho`

- Principle: `Uma conversão isolada é evento, não crescimento — o motor só existe quando o ciclo se repete sem esforço novo a cada vez.`
- Action: `Identifiquem o momento em que um usuário satisfeito poderia indicar ou voltar sozinho, e removam a fricção desse momento.`

### Result screen

- Eyebrow: `Resultado`
- Section labels: `Seu perfil por fase`, `Pontos fortes`, `Gargalos`
- Card labels: `Por que isso importa:` and `Próximo passo sugerido`
- CTA title: `Esse número é um ponto de partida — não um diagnóstico completo.`
- CTA body: `A gente pode se aprofundar de verdade nos pontos de atenção, mapear o motor de crescimento do seu produto e desenhar os próximos passos junto com você.`
- Buttons: `Falar com a Norn`, `Copiar link do resultado`, `Refazer diagnóstico`
- Copy confirmation: `Link copiado.`
