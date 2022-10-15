import Head from 'next/head'
import libs from 'data/libraries'
import { useRouter } from 'next/router'

export default function SEO() {
  const { query } = useRouter()
  const [lib] = query.slug as string[]

  const currentSeo = libs[lib]
  if (!currentSeo) return null

  const title = `${currentSeo.title} Documentation`

  return (
    <Head>
      <title>{title}</title>
      <meta property="og:site_name" content={title} />
      <meta name="description" content={currentSeo.description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://docs.pmnd.rs/${lib}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={currentSeo.description} />
      <meta property="og:image" content={currentSeo.image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://docs.pmnd.rs/${lib}`} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={currentSeo.description} />
      <meta property="twitter:image" content={currentSeo.image} />
    </Head>
  )
}
