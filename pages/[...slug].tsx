import { useMemo } from 'react'
import { MDXProvider } from '@mdx-js/react'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import components from 'components/mdx'
import { hydrate, getDocs, Doc } from 'utils/docs'

export default function PostPage({ nav, title, description, content }) {
  const post = useMemo(() => hydrate(content), [content])
  return (
    <Layout nav={nav}>
      <SEO />
      <main className="max-w-3xl mx-auto">
        <div className="pb-6 mb-4 border-b post-header">
          <h1 className="mb-4 text-5xl font-bold tracking-tighter">{title}</h1>
          {description?.length && (
            <p className="text-base leading-4 text-gray-400 leading-5">{description}</p>
          )}
        </div>
        <main className="content-container">
          <MDXProvider {...post} components={components} />
        </main>
      </main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const docs: Map<string, Doc> = await getDocs(...params.slug)
  if (!docs) return { notFound: true }

  const pathname = params.slug.join('/')

  if (!docs.has(pathname)) {
    const alternate = Array.from(docs.keys()).find((key: string) => key.startsWith(pathname))
    return alternate
      ? { redirect: { permanent: false, destination: `/${alternate}` } }
      : { notFound: true }
  }

  const doc = docs.get(pathname)

  const nav = Array.from(docs.values())
    .sort((a, b) => (a.nav > b.nav ? 1 : -1))
    .reduce((acc, doc) => {
      const [lib, ...rest] = doc.slug
      const [page, category] = rest.reverse()

      if (category && !acc[category]) acc[category] = {}

      if (category) acc[category][page] = doc
      else acc[page] = doc

      return acc
    }, {})

  return { props: { ...doc, nav }, revalidate: 300 }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs()).map((params) => ({ params }))
  return { paths, fallback: 'blocking' }
}
