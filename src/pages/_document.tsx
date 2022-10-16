import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#000000" />
        <meta name="apple-mobile-web-app-title" content="PMNDRS" />
        <meta name="application-name" content="PMNDRS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        <meta name="msapplication-starturl" content="https://pmnd.rs/" />
        <meta name="msapplication-tilecolor" content="#000000" />
        <meta name="msapplication-tileimage" content="/mstile-144x144.png" />
        <meta name="msapplication-tooltip" content="PMNDRS" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@pmndrs" />
        <meta name="twitter:site" content="@pmndrs" />
        <meta property="og:locale" content="en_us" />
        <meta property="og:type" content="website" />

        <link rel="preload" href="/fonts/inter-regular.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-medium.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-semibold.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/inter-bold.woff2" as="font" crossOrigin="true" />
        <link rel="preload" href="/fonts/meslo.woff2" as="font" crossOrigin="" />
      </Head>
      <body tabIndex={-1}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
