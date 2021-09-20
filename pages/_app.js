import Head from 'next/head';
import '../styles/index.scss';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1,width=device-width" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
