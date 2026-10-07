import { PrimaryColorMtb } from '@/components/PrimaryColorMtb'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import localFont from 'next/font/local'
import './globals.css'
import { SandpackCSS } from './sandpack-styles'

const inter = localFont({
  src: [
    {
      path: '../fonts/inter/inter-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/inter/inter-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/inter/inter-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/inter/inter-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-inter',
})

const inconsolata = localFont({
  src: [
    {
      path: '../fonts/inconsolata/inconsolata-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/inconsolata/inconsolata-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/inconsolata/inconsolata-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-inconsolata',
})

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL
const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME

const title = NEXT_PUBLIC_LIBNAME
const description = `Documentation for ${NEXT_PUBLIC_LIBNAME}`
const url = NEXT_PUBLIC_URL
const siteName = NEXT_PUBLIC_LIBNAME

// The icon `ICON` describes, published at `/icon.svg` (`src/app/icon.svg/route.ts`): the very file
// the libraries menu of the other pmndrs docs sites shows, so the two cannot diverge. Next adds
// neither the base path nor `metadataBase` to an icon URL: it is written as is.
const icon = []
if (process.env.ICON) {
  icon.push({ url: `${process.env.BASE_PATH || ''}/icon.svg`, type: 'image/svg+xml' })
}

export const metadata: Metadata = {
  metadataBase: NEXT_PUBLIC_URL ? new URL(NEXT_PUBLIC_URL) : undefined,
  title,
  description: `Documentation for ${NEXT_PUBLIC_LIBNAME}`,
  icons: {
    icon,
  },
  openGraph: {
    title,
    description,
    url,
    siteName,
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const primary = process.env.THEME_PRIMARY || '#323e48'
  const note = process.env.THEME_NOTE || '#1f6feb'
  const tip = process.env.THEME_TIP || '#238636'
  const important = process.env.THEME_IMPORTANT || '#8957e5'
  const warning = process.env.THEME_WARNING || '#d29922'
  const caution = process.env.THEME_CAUTION || '#da3633'
  const storybook = process.env.THEME_STORYBOOK || '#ff4785'
  const npm = process.env.THEME_NPM || '#cb3837'
  const chromatic = process.env.THEME_CHROMATIC || '#fc521f'
  const scheme = (process.env.THEME_SCHEME || 'tonalSpot') as
    | 'content'
    | 'expressive'
    | 'fidelity'
    | 'monochrome'
    | 'neutral'
    | 'tonalSpot'
    | 'vibrant'
  const contrast = Number(process.env.THEME_CONTRAST) || 0
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${inconsolata.variable}`}
    >
      <head>
        <link rel="alternate" type="text/plain" href={`${basePath}/llms.txt`} />
        <link rel="alternate" type="text/plain" href={`${basePath}/llms-full.txt`} />
        <SandpackCSS />
      </head>
      <body
        className="wrap-break-word bg-surface text-on-surface"
        // Brand colors, for their badges: as is, in light and dark alike — not given to `<Mtb>`,
        // whose tones of them are muted pinks, not the brand
        style={
          {
            '--brand-storybook': storybook,
            '--brand-npm': npm,
            '--brand-chromatic': chromatic,
          } as React.CSSProperties
        }
      >
        <PrimaryColorMtb
          source={primary}
          scheme={scheme}
          contrast={contrast}
          customColors={[
            { name: 'note', hex: note, blend: true },
            { name: 'tip', hex: tip, blend: true },
            { name: 'important', hex: important, blend: true },
            { name: 'warning', hex: warning, blend: true },
            { name: 'caution', hex: caution, blend: true },
          ]}
        >
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </PrimaryColorMtb>
      </body>
    </html>
  )
}
