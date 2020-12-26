import { AppProps } from 'next/app'
import '../css/main.css'

function Layout (props) {
  return <div className="prose p-4">
      {props.children}
    </div>
}

function App({ Component, pageProps }: AppProps) {
  return <Layout><Component {...pageProps} /></Layout>
}

export default App
