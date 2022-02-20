import { useMemo, useEffect } from 'react'
import { MDXProvider } from '@mdx-js/react'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import components from 'components/mdx'
import useDocs from 'hooks/useDocs'
import { hydrate, getDocs, Doc } from 'utils/docs'

export default function PostPage({ docs, title, description, content }) {
  const { setDocs } = useDocs()
  const { toc, ...post } = useMemo(() => hydrate(content), [content])

  useEffect(() => void setDocs(docs), [setDocs])

  return (
    <Layout toc={toc}>
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
  const matches: Map<string, Doc> = await getDocs(...params.slug)
  if (!matches) return { notFound: true }

  const pathname = params.slug.join('/')

  if (!matches.has(pathname)) {
    const alternate = Array.from(matches.keys()).find((key: string) => key.startsWith(pathname))
    return alternate
      ? { redirect: { permanent: false, destination: `/${alternate}` } }
      : { notFound: true }
  }

  const docs = Array.from(matches.values()).sort((a, b) => (a.nav > b.nav ? 1 : -1))
  const { title, description, content } = matches.get(pathname)

  return { props: { docs, title, description, content }, revalidate: 300 }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs()).map((params) => ({ params }))
  return { paths, fallback: 'blocking' }
}
