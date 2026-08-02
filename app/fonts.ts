import localFont from 'next/font/local'

export const cabinetGrotesk = localFont({
  src: [
    {
      path: './fonts/cabinet-grotesk/CabinetGrotesk-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
})

export const generalSans = localFont({
  src: [
    {
      path: './fonts/general-sans/GeneralSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/general-sans/GeneralSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
})
