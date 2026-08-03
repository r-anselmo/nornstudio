import { LiquidEtherBackground } from '@/components/liquid-ether-background'
import { LiveClock } from '@/components/live-clock'
import { NornBadge } from '@/components/ui/norn-badge'

export function HeroSection() {
  return (
    <main className="relative flex min-h-svh w-full flex-col overflow-hidden bg-carbon-black px-6 py-6 md:px-12 md:py-10">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <LiquidEtherBackground />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex items-center gap-4">
          <NornBadge />
          <div className="h-px flex-1 bg-alabaster/30" />
          <LiveClock />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-[0.02em] text-alabaster md:text-6xl lg:text-7xl">
            <span className="block">TODO MUNDO</span>
            <span className="block">FALA EM</span>
            <span className="block">ESTRATÉGIA.</span>
            <span className="mt-2 block rounded-xl bg-lime px-4 py-1 text-carbon-black">
              A GENTE
            </span>
            <span className="mt-2 block rounded-xl bg-lime px-4 py-1 text-carbon-black">
              EXECUTA.
            </span>
          </h1>

          <p className="max-w-sm font-body text-base text-platinum-gray md:text-lg">
            Do experimento ao resultado: a gente acelera suas iniciativas
            digitais por dentro.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contato"
              className="flex items-center gap-2 rounded-full border border-lime px-6 py-3 font-body text-sm font-medium text-lime"
            >
              Iniciar Projeto
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#servicos"
              className="font-body text-sm font-medium text-lime"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <footer className="flex items-end justify-between font-body text-xs font-medium tracking-[0.02em] text-alabaster">
          <div>
            <p>ATUANDO GLOBALMENTE</p>
            <p className="text-platinum-gray">SEM ESCRITÓRIO, POR OPÇÃO</p>
          </div>
          <div className="text-right">
            <p>AGENDA ABERTA, 2026</p>
            <p className="text-platinum-gray">NO SEU FUSO-HORÁRIO</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
