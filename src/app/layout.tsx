import { PrimaryColorMtb } from '@/components/PrimaryColorMtb'
import { inconsolata, inter } from '@/lib/fonts'
import { docsMtb } from '@/lib/mtb'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { SandpackCSS } from './sandpack-styles'

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
  const storybook = process.env.THEME_STORYBOOK || '#ff4785'
  const npm = process.env.THEME_NPM || '#cb3837'
  const chromatic = process.env.THEME_CHROMATIC || '#fc521f'
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(inconsolata.variable, 'font-sans', inter.variable)}
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
        {/* The pmndrs seed, the site's own seeds and custom colours, and our alert colours
            (`docsMtb`), reseeded by whatever the reader picks
            (see `PrimaryColorPicker`): the one place `--md-sys-color-*` is defined. A client
            component, since the palette follows those picks live; the server's HTML still carries
            the default one */}
        <PrimaryColorMtb {...docsMtb}>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </PrimaryColorMtb>
      </body>
    </html>
  )
}
