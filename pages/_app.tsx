import { AppProps } from 'next/app'
import '../css/main.css'
import '../css/pmndrs.css'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default App
