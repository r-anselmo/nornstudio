import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import { motionGateScript } from '@/lib/motion'
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGateScript }} />
      </head>
      <body className="font-body antialiased">
        <ContactDialogProvider>{children}</ContactDialogProvider>
      </body>
    </html>
  )
}
