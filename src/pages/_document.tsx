import { Head, Html, Main, NextScript } from 'next/document'
import cookie from 'cookiejs'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="preload" href="/fonts/inter-regular.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-medium.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-semibold.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-bold.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/meslo.woff2" as="font" crossOrigin="" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                try {
                  if (localStorage.theme === 'dark') {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}
              `,
          }}
        />
      </Head>
      <body tabIndex={-1}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
