import cn from '@/lib/cn'
import { svg } from '@/utils/icon'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inconsolata, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const inconsolata = Inconsolata({ subsets: ['latin'] })

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'bg-surface')}>
        <ThemeProvider
        // attribute="class"
        // defaultTheme="system"
        // enableSystem
        // disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
