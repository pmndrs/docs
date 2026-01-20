import cn from '@/lib/cn'
import { svg } from '@/utils/icon'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Mcu } from 'react-mcu'
import './globals.css'
import { SandpackCSS } from './sandpack-styles'

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL
const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME

const title = NEXT_PUBLIC_LIBNAME
const description = `Documentation for ${NEXT_PUBLIC_LIBNAME}`
const url = NEXT_PUBLIC_URL
const siteName = NEXT_PUBLIC_LIBNAME

const icon = []
if (process.env.ICON) {
  if (process.env.ICON.startsWith('/')) {
    // "normal" icon
    icon.push({
      url: resolveMdxUrl(process.env.ICON, '/', process.env.MDX_BASEURL),
    })
  } else {
    // Emoji icon
    icon.push({
      url: `data:image/svg+xml,${encodeURIComponent(svg(process.env.ICON))}`,
    })
  }
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
  const scheme = (process.env.THEME_SCHEME || 'tonalSpot') as
    | 'content'
    | 'expressive'
    | 'fidelity'
    | 'monochrome'
    | 'neutral'
    | 'tonalSpot'
    | 'vibrant'
  const contrast = Number(process.env.THEME_CONTRAST) || 0

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SandpackCSS />
      </head>
      <body className={cn('font-sans', 'wrap-break-word bg-surface text-on-surface')}>
        <Mcu
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
        </Mcu>
      </body>
    </html>
  )
}
