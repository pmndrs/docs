import type { AppProps } from 'next/app'
import './main.css'
import './pmndrs.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
