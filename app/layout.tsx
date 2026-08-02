import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Norn — Growth Design',
  description:
    'Do experimento ao resultado: a gente acelera suas iniciativas digitais por dentro.',
}

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
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
