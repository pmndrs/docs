import { useMemo } from 'react'
import { MDXProvider } from '@mdx-js/react'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import components from 'components/mdx'
import { hydrate, getDocs } from 'utils/docs'

export default function PostPage({ data, content }) {
  const post = useMemo(() => hydrate(content), [content])
  return (
    <Layout>
      {/* <SEO lib={lib} /> */}
      <main className="max-w-3xl mx-auto">
        {data.title && (
          <div className="pb-6 mb-4 border-b post-header">
            <h1 className="mb-4 text-5xl font-bold tracking-tighter">{data.title}</h1>
            {data.description && (
              <p className="text-base leading-4 text-gray-400 leading-5">{data.description}</p>
            )}
          </div>
        )}
        <main className="content-container">
          <MDXProvider {...post} components={components} />
        </main>
      </main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const docs = await getDocs(...params.slug)
  if (!docs) return { notFound: true }

  const pathname = params.slug.join('/')
  const props = docs.get(pathname)

  if (!props) {
    const alternate = Array.from(docs.keys()).find((key: string) => key.startsWith(pathname))
    return alternate
      ? { redirect: { permanent: false, destination: `/${alternate}` } }
      : { notFound: true }
  }

  return { props, revalidate: 300 }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs()).map((params) => ({ params }))
  return { paths, fallback: 'blocking' }
}
