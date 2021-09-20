import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class Doc extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="amphtml" href="https://pmnd.rs/" />
          <link rel="canonical" href="https://pmnd.rs/" />
          <meta name="googlebot" content="follow, index, noarchive" />
          <meta name="robots" content="follow, index, noarchive" />

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

          <meta name="description" content="Poimandres" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@pmndrs" />
          <meta name="twitter:site" content="@pmndrs" />
          <meta property="og:locale" content="en_us" />
          <meta property="og:site_name" content="Poimandres" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://pmnd.rs" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
