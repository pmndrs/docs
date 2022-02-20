import Head from 'next/head'
import libs from 'data/libraries'

export default function SEO({ lib }: { lib?: keyof typeof libs }) {
  const currentSeo = libs[lib]
  if (!currentSeo) return null

  return (
    <Head>
      <title> {currentSeo.title} Documentation</title>
      <meta property="og:site_name" content={`${currentSeo.title} Documentation`} />
      <meta name="description" content={currentSeo.description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://docs.pmnd.rs/${lib}`} />
      <meta property="og:title" content={`${currentSeo.title} Documentation`} />
      <meta property="og:description" content={currentSeo.description} />
      <meta property="og:image" content={currentSeo.image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://docs.pmnd.rs/${lib}`} />
      <meta property="twitter:title" content={`${currentSeo.title} Documentation`} />
      <meta property="twitter:description" content={currentSeo.description} />
      <meta property="twitter:image" content={currentSeo.image} />
    </Head>
  )
}
