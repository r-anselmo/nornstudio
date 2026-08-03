# ChatFlowSection — "Como fazemos" (chat animado)

## Context

A landing page da Norn hoje tem duas seções: [hero-section.tsx](components/hero-section.tsx) e [what-we-do-section.tsx](components/what-we-do-section.tsx). Falta a seção que explica **como** o estúdio trabalha.

A referência enviada mostra um recorte de conversa real entre cliente e Norn, dividido em 4 fases (`01 · DESCOBRIR` → `04 · ENTREGAR`), com bolhas de chat, anexos, reação e um indicador de digitação no fim. O objetivo é transformar "nosso processo" em algo que se lê como uma conversa de verdade, em vez de uma lista de bullets — e animar isso conforme o usuário rola.

Decisões já fechadas com o usuário:
- **Reveal ao rolar** (não autoplay em janela fixa, não sticky scrub) — seção longa, ritmo controlado pelo scroll.
- **CSS puro + `tw-animate-css`** (já importado em [globals.css](app/globals.css), hoje sem uso) — sem instalar `framer-motion`.
- **Avatares sem asset novo** — cliente = ícone `User` do lucide; Norn = bloco lime com "N", igual ao hero.
- **Desktop = coluna central estreita** (`max-w-2xl` dentro do `max-w-5xl`).

Correções de copy aplicadas em relação ao print (erros de digitação na referência): `burocarica` → **burocracia**, `onboardng` → **onboarding**, `comercial acha que e preço` → **é preço**.

---

## Arquitetura

Quatro arquivos novos + wiring na home. A seção continua **server component** (convenção do repo); só a linha de mensagem é cliente.

| Arquivo | Papel |
|---|---|
| `lib/prefers-reduced-motion.ts` | Espelha [is-touch-device.ts](lib/is-touch-device.ts) — mesmo guard de `matchMedia` |
| `lib/chat-flow-script.ts` | Dados tipados da conversa (fases + mensagens). **Toda a copy vive aqui** |
| `components/chat-message-row.tsx` | `'use client'` — reveal por IntersectionObserver, estado de digitação, avatar, bolha. Exporta `ChatMessageRow`, `ChatAvatar`, `ChatTypingDots` |
| `components/chat-flow-section.tsx` | Server component — header, divisórias de fase, mapeia o script |

Wiring: adicionar `<ChatFlowSection />` depois de `<WhatWeDoSection />` em [app/page.tsx](app/page.tsx).

### Por que a copy fica em `lib/chat-flow-script.ts` e não no JSX

`react/no-unescaped-entities` é **error-level** neste ESLint config. Qualquer `'` ou `"` em texto JSX quebra `npm run lint`. A regra só inspeciona filhos de JSX — strings em um módulo `.ts` são imunes. Isto é estrutural, não estético: **não inline nenhuma frase da conversa no JSX**.

### Modelo de dados

```ts
export type ChatAttachment = { kind: 'pdf' | 'doc'; name: string }

export type ChatMessage = {
  id: string
  sender: 'client' | 'norn'
  lines: string[]          // uma <span className="block"> por linha
  emphasis?: string        // substring da última linha renderizada em <strong>
  attachment?: ChatAttachment
  reaction?: string        // ex.: '2 🔥' — pill abaixo da bolha
}

export type ChatPhase = { id: string; step: string; label: string; messages: ChatMessage[] }
```

`kind` é **string**, não `LucideIcon`. lucide-react 1.28 não tem `'use client'`, então passar a referência do ícone como prop para um client component quebra o build (`Functions cannot be passed directly to Client Components`). O ícone é resolvido dentro do server component pelo `kind`.

### Máquina de estados do `ChatMessageRow`

```
'initial'  → SSR + 1º render cliente: conteúdo visível, sem classes de animação
             (idêntico no servidor e no cliente ⇒ sem hydration mismatch;
              e getByText funciona síncrono no teste da seção)
   ↓ useEffect → setTimeout(..., 0)
   ├─ prefersReducedMotion() OU typeof IntersectionObserver === 'undefined'
   │    → return ANTES de qualquer setPhase (fica em 'initial' para sempre)
   └─ senão → setPhase('hidden')  [opacity-0]  e SÓ ENTÃO cria+attacha o observer
        ↓ on intersect
        ├─ sender 'client' → 'shown'
        └─ sender 'norn'   → 'typing' (dots) --700ms--> 'shown'
```

Três detalhes que são **requisito de correção**, não estilo:

1. O early-return de reduced-motion / sem-IO acontece **antes** de qualquer `setPhase`. Sem isso o teste da seção (timers reais) pode disparar um `setPhase` fora de `act()`.
2. O `new IntersectionObserver(...)` fica **dentro do mesmo `setTimeout`, depois do `setPhase('hidden')`**. Se for criado no corpo do effect, a entrada inicial do IO pode chegar antes do `setPhase('hidden')` pendente — a linha vai para `'shown'` e depois é jogada de volta para `'hidden'` **permanentemente**. Guard extra barato: `setPhase(p => (p === 'shown' ? p : 'hidden'))`.
3. O `ref` observado é o **wrapper externo estável** da linha, não a bolha — a bolha é trocada no estado `'typing'` e o observer ficaria segurando um nó destacado.

O `setTimeout(..., 0)` é o padrão que o repo já usa para contornar `react-hooks/set-state-in-effect` ([live-clock.tsx:12](components/live-clock.tsx#L12), [liquid-ether-background.tsx:11-13](components/liquid-ether-background.tsx#L11-L13)) — mantenha o mesmo comentário explicativo. Validado: a regra não inspeciona callbacks aninhados, então `setPhase` dentro do `setTimeout` e dentro do callback do IO passa limpo.

Existe **um frame** de conteúdo visível antes do `opacity-0` (effects passivos rodam depois do paint). A seção fica abaixo de um hero `min-h-svh`, então é imperceptível na prática.

Observer: `{ threshold: 0, rootMargin: '0px 0px -15% 0px' }`. Threshold fracionado nunca dispara para bolhas mais altas que a fração da viewport no mobile. Desconectar após revelar (reveal é one-shot).

---

## Especificação visual

Tokens existentes apenas — `lime #C6F432`, `carbon-black`, `platinum-gray`, `alabaster`. Sem tokens novos.

**Casca da seção** (idêntica à WhatWeDoSection):
`<section className="bg-carbon-black px-6 py-16 md:px-12 md:py-24">` → `<div className="mx-auto flex max-w-5xl flex-col gap-6">` → coluna do chat `mx-auto w-full max-w-2xl`.

**Eyebrow com colchetes** — padrão novo, fiel à referência (a WhatWeDoSection usa uma pill com borda lime; unificar os dois é decisão separada, fora de escopo aqui):

```tsx
<span className="relative inline-flex w-fit items-center px-3 py-1 font-body text-xs font-medium tracking-[0.02em] text-lime">
  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 border-y border-l border-lime" />
  {LABEL_COMO_FAZEMOS}
  <span aria-hidden="true" className="absolute inset-y-0 right-0 w-2 border-y border-r border-lime" />
</span>
```

**Header:** `<h2 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-4xl">` + `<p className="font-body text-base text-platinum-gray">`.

**Divisória de fase:** hairline + label lime + hairline. O label é `<h3>` (mantém o outline do documento: h1 hero → h2 seção → h3 fase).

```tsx
<div className="flex items-center gap-3">
  <span aria-hidden="true" className="h-px flex-1 bg-alabaster/15" />
  <h3 className="font-body text-xs font-medium tracking-[0.02em] text-lime">01 · DESCOBRIR</h3>
  <span aria-hidden="true" className="h-px flex-1 bg-alabaster/15" />
</div>
```

**Linha de mensagem:**
- cliente → `justify-start`, avatar à esquerda; bolha `rounded-2xl bg-alabaster/10`
- norn → `justify-end`, avatar à direita; bolha `rounded-2xl border-r-2 border-r-lime bg-alabaster/10` (o arco lime do print é a borda direita acompanhando o `rounded-2xl`; `border-r-lime` sozinho não renderiza nada — preflight zera `border-width`)
- bolha: `max-w-[80%] px-4 py-2.5 font-body text-sm leading-relaxed text-alabaster`

**Avatares** (`h-9 w-9 shrink-0 items-center justify-center rounded-xl`):
- cliente: `bg-alabaster/10` + `<User className="h-4 w-4 text-platinum-gray" aria-hidden="true" />`
- norn: `bg-lime` + `<span className="font-heading text-lg font-black text-carbon-black">N</span>`

**Chip de anexo** (dentro da bolha): `mt-2 flex w-fit items-center gap-2 rounded-xl bg-alabaster/20 px-3 py-2 font-body text-sm text-alabaster`, ícone `FileText` (pdf) / `FileCode2` (doc), `h-4 w-4 shrink-0 text-alabaster`.

**Pill de reação:** `w-fit rounded-full border border-alabaster/15 bg-alabaster/10 px-3 py-1 font-body text-xs text-alabaster`, abaixo da bolha.

**Dots de digitação:** três `h-1.5 w-1.5 rounded-full`, os dois primeiros `bg-platinum-gray`, o terceiro `bg-lime`; `animate-pulse motion-reduce:animate-none` com `style={{ animationDelay: '0ms' | '150ms' | '300ms' }}`. Wrapper `aria-hidden="true"`. Usados em dois lugares: estado `'typing'` da linha e o indicador permanente no fim da conversa.

**Classes de animação** (`'shown'`): `animate-in fade-in duration-500 fill-mode-both` + `slide-in-from-left-4` (cliente) ou `slide-in-from-right-4` (norn).

Três armadilhas confirmadas na compilação real do CSS:
- `delay-*` **não** seta `animation-delay` neste stack — o `delay-*` do core do Tailwind sombreia o do tw-animate-css e emite `transition-delay`. Use `style={{ animationDelay }}` inline. Vale também para os dots.
- Nada de nome de classe dinâmico (`` `slide-in-from-${side}-4` ``) — o scanner do Tailwind precisa de literais. Use ternário com as duas strings completas.
- `fill-mode-both` faz o elemento segurar o keyframe inicial durante o delay, então não há flash pré-delay.

**Stagger:** `delayMs = Math.min(indexInPhase, 3) * 80`. Índice **dentro da fase**, não global — cada linha observa a si mesma, então um índice global faria a 10ª mensagem ficar ~800ms invisível depois de já estar na tela.

**Layout shift:** o estado `'typing'` troca a bolha pelos dots e a altura pula quando o texto entra. Reserve espaço renderizando o texto com `invisible` atrás dos dots (dots em `absolute inset-0 flex items-center`), para nada abaixo pular durante o scroll.

---

## Conteúdo

Header — eyebrow `Como fazemos`; h2 `Sem enrolação. Sem burocracia`; sub `Um recorte real de como um ciclo roda: do problema à solução e ao próximo teste.`

| Fase | # | Autor | Conteúdo |
|---|---|---|---|
| 01 · DESCOBRIR | 1 | cliente | `Queremos escalar 🚀!` |
| | 2 | norn | `Qual métrica te tira o sono hoje?` |
| | 3 | cliente | `Conversão está caindo e não sabemos a causa!` |
| | 4 | norn | `Dados não mentem. Vamos analisar o funil e decidir juntos.` |
| 02 · DEFINIR | 5 | cliente | `Produto acha que é o onboarding, comercial acha que é preço.` |
| | 6 | norn | `Conversamos com a equipe e levantamos as hipóteses` + anexo `backlog-hipoteses.pdf` (pdf) |
| | 7 | norn | `8 hipóteses, ICE score decide: onboarding será a primeira hipótese` — emphasis `onboarding` |
| 03 · DESENVOLVER | 8 | norn | `Protótipo pronto.` / `MVP no ar, teste A/B rodando` + anexo `onboarding-teste-ab.md` (doc) + reação `2 🔥` |
| 04 · ENTREGAR | 9 | cliente | `E quando vamos ver resultados?` |
| | 10 | norn | `Variante B: +22% de ativação. shipando!` — emphasis `+22% de ativação.` |
| | 11 | cliente | `E agora?` |
| | 12 | norn | `Próxima hipótese entra amanhã. O processo é contínuo.` |

Fecha com o indicador de digitação permanente do cliente (avatar + dots), sem `ChatMessageRow` — é JSX estático na seção.

Emoji em JSX passa no lint e no build. As fontes locais (Cabinet Grotesk / General Sans) não têm glifos de emoji, então caem no emoji do sistema — envolva cada um em `<span role="img" aria-label="...">` para garantir label acessível.

---

## Tarefas (TDD — teste falhando primeiro, commit por tarefa)

**1. `lib/prefers-reduced-motion.ts` + teste**
Cópia exata do guard de [is-touch-device.ts](lib/is-touch-device.ts) — **jsdom 30 não tem `window.matchMedia`**, e sem o guard toda renderização da seção lança `TypeError`:
```ts
if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
return window.matchMedia('(prefers-reduced-motion: reduce)').matches
```
Testes: `matchMedia` ausente → `false`; `matches: true` → `true`; `matches: false` → `false`.

**2. `lib/chat-flow-script.ts`** — tipos + `chatPhases` + as constantes de copy do header. Sem teste próprio (é dado puro, coberto pelo teste da seção).

**3. `components/chat-message-row.tsx` + teste** — a máquina de estados acima, exportando `ChatMessageRow` (props `sender`, `delayMs`, `children`, `footer?`), `ChatAvatar`, `ChatTypingDots`.

Expor `data-phase` no wrapper externo e **testar contra ele**, não contra strings de classe do Tailwind (que serão ajustadas no polimento visual). Testes, seguindo o arquétipo de [live-clock.test.tsx](components/live-clock.test.tsx) e [liquid-ether-background.test.tsx](components/liquid-ether-background.test.tsx):
- stub de `IntersectionObserver` via `vi.stubGlobal` capturando o callback; `vi.useFakeTimers()` em `beforeEach`; `vi.useRealTimers()` + `vi.unstubAllGlobals()` em `afterEach` (o `afterEach(cleanup)` global de [vitest.setup.ts](vitest.setup.ts) roda depois, sob timers reais — ordem correta)
- `act(() => vi.advanceTimersByTime(0))` → `'hidden'` e `observe()` chamado
- `act(() => intersect())` numa linha `norn` → `'typing'`; `act(() => vi.advanceTimersByTime(700))` → `'shown'` e o texto no DOM
- linha `client` intersectada → `'shown'` direto, sem passar por `'typing'`
- sem `IntersectionObserver` no global → fica em `'initial'`, filhos renderizados
- `matchMedia` retornando `matches: true` → fica em `'initial'`

Use `act()` **síncrono**. Nada de `await act(async ...)`, `waitFor` ou `findBy*` com fake timers — trava.

**4. `components/chat-flow-section.tsx` + teste** — header, 4 divisórias, mapeia `chatPhases`, indicador final.

Como jsdom não tem `IntersectionObserver`, toda linha fica em `'initial'` e o teste é **síncrono com `getByText`**, igual a [what-we-do-section.test.tsx](components/what-we-do-section.test.tsx). Cobrir: eyebrow, h2, subtítulo, os 4 labels de fase, todas as 12 mensagens (loop sobre `chatPhases`), os dois anexos, a reação `2 🔥`, e as duas strings de emphasis. Atenção: `getAllByText('N')` (plural) — há 8 avatares Norn.

**5. Wiring + verificação** — `<ChatFlowSection />` em [app/page.tsx](app/page.tsx) após `<WhatWeDoSection />`, com asserção no teste da home se houver.

**6. Documentar** — spec em `docs/superpowers/specs/2026-08-03-chat-flow-section-design.md` e plano em `docs/superpowers/plans/2026-08-03-chat-flow-section.md`, seguindo a convenção dos docs existentes. Commitar junto o `docs/superpowers/plans/2026-08-02-what-we-do-section.md` que hoje está untracked.

---

## Verificação

```bash
npx vitest run components/chat-message-row.test.tsx   # FAIL → PASS por tarefa
npx vitest run                                        # suíte inteira (17 testes hoje + novos)
npm run lint                                          # baseline: 0 erros, 3 warnings (LiquidEther.jsx)
npx tsc --noEmit
npm run build                                         # confirma que output:"export" não quebra
```

`npm run lint` é o passo de maior risco (`react/no-unescaped-entities`). Se falhar, a causa quase certa é copy vazada para dentro do JSX.

Verificação manual no navegador (`npm run dev`):
- **390px** — coluna única, bolhas alternando lados, `max-w-[80%]` sem estourar, emoji renderizando
- **md / lg** — chat centralizado em `max-w-2xl`, divisórias de fase esticando na largura da coluna
- **Rolar devagar** pela seção: cada fase revela com stagger; bolhas da Norn mostram os dots antes do texto; **nada abaixo pula** quando o texto substitui os dots
- **Rolar rápido até o fim e voltar**: nenhuma bolha fica presa invisível (o guard do race IO × `setTimeout`)
- **DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`** e recarregar: tudo visível de imediato, sem animação e sem dots
- Indicador de digitação final pulsando em loop, terceiro dot lime
