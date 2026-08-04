import type { Metadata } from 'next'
import { cabinetGrotesk, generalSans } from './fonts'
import { motionGateScript } from '@/lib/motion'
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
import { heroTagline, siteName, siteUrl } from '@/lib/hero'
import './globals.css'

export const metadata: Metadata = {
  // Open Graph consumers do not resolve relative URLs, and a static export has
  // no request to infer an origin from. Without this the card silently points
  // at localhost and every share renders bare.
  metadataBase: new URL(siteUrl),
  title: siteName,
  // Same sentence the hero shows. It lived in two places before lib/hero.ts.
  description: heroTagline,
  openGraph: {
    title: siteName,
    description: heroTagline,
    siteName,
    locale: 'pt_BR',
    type: 'website',
    url: siteUrl,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    // Next points twitter:image at the same generated file, so there is no
    // twitter-image.tsx to keep in sync with the Open Graph one.
    card: 'summary_large_image',
    title: siteName,
    description: heroTagline,
  },
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
