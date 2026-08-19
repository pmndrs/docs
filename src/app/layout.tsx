import { cn } from '@/lib/utils'
import { docsMtb } from '@/lib/mtb'
import { svg } from '@/utils/icon'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import { builder } from 'material-theme-builder'
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

/**
 * The rendered palette, computed on the server.
 *
 * This site installs `md3-base` rather than `md3` — the design system without its baked
 * palette — because it supplies its own: `docsMtb` adds the five alert colours,
 * and `blend: true` derives them from whatever `THEME_PRIMARY` the deployment
 * set, which an upstream bake cannot know. So this `<style>` is the only place
 * `--md-sys-color-*` is defined; nothing overrides anything.
 *
 * `builder` is the package's root export and carries no `'use client'` — only
 * `material-theme-builder/react` does. Calling it here keeps the palette code
 * off the client entirely. It costs ~2 kB brotli of repeated `<style>` per
 * document, which is cheaper than the build step it would take to hoist it into
 * the stylesheet.
 */
const { source, ...mtbOptions } = docsMtb
const md3Css = builder(source, mtbOptions).toCss()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${inconsolata.variable}`}
    >
      <head>
        <link rel="alternate" type="text/plain" href={`${basePath}/llms.txt`} />
        <link rel="alternate" type="text/plain" href={`${basePath}/llms-full.txt`} />
        <SandpackCSS />
        <style dangerouslySetInnerHTML={{ __html: md3Css }} />
      </head>
      <body className="wrap-break-word bg-surface text-on-surface">
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  )
}
