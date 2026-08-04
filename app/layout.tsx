import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import { MOTION_GATE_CLASS } from '@/lib/motion'
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Norn — Growth Design',
  description:
    'Do experimento ao resultado: a gente acelera suas iniciativas digitais por dentro.',
}

/**
 * Runs before first paint so the hidden-initial states in globals.css apply
 * from frame one. React state cannot do this — it settles after hydration,
 * which is after the first paint.
 *
 * The class means "reveal animations will run", so it checks the same two
 * conditions the JS guards do. A browser that cannot advance a reveal never
 * gets the class and therefore never hides anything.
 *
 * Self-contained by necessity: this executes before any module loads, so it
 * cannot import MOTION_GATE_CLASS — the constant is interpolated in instead.
 */
const motionGateScript = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window)document.documentElement.classList.add("${MOTION_GATE_CLASS}")`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cabinetGrotesk.variable} ${generalSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGateScript }} />
      </head>
      <body className="font-body antialiased">
        <ContactDialogProvider>{children}</ContactDialogProvider>
      </body>
    </html>
  )
}
