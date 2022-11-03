import * as React from 'react'
import { useRouter } from 'next/router'
import type { GetStaticProps } from 'next'
import type libs from 'data/libraries'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import Post from 'components/Post'
import { Doc, DocsContext } from 'hooks/useDocs'
import { type CSB, CSBContext, fetchCSB } from 'hooks/useCSB'
import { getDocs } from 'utils/docs'

export interface PostPageProps {
  redirect: boolean
  docs: Doc[]
  doc: Doc
  boxes: Record<string, CSB>
}

export default function PostPage({ redirect, docs, doc, boxes }: PostPageProps) {
  const router = useRouter()

  React.useEffect(() => {
    if (redirect) router.replace(doc.url, undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DocsContext.Provider value={docs}>
      <CSBContext.Provider value={boxes}>
        <Layout doc={doc}>
          <SEO />
          <main className="max-w-3xl mx-auto">
            <div className="pb-6 mb-4 border-b post-header">
              <h1 className="mb-4 text-5xl font-bold tracking-tighter">{doc.title}</h1>
              {!!doc.description?.length && (
                <p className="text-base leading-4 text-gray-400 leading-5">{doc.description}</p>
              )}
            </div>
            <main className="content-container">
              <Post {...doc.source} />
            </main>
          </main>
        </Layout>
      </CSBContext.Provider>
    </DocsContext.Provider>
  )
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slug = params!.slug as string[]
  const lib = slug[0] as keyof typeof libs

  const docs = await getDocs(lib)
  if (!docs?.length) return { notFound: true }

  const url = `/${slug.join('/')}`.toLowerCase()
  let doc = docs.find((doc) => doc.url === url)

  // Handle alternate routes
  let redirect = !doc
  if (!doc) {
    doc = docs.find((doc) => doc.url.startsWith(url))
    if (!doc) return { notFound: true }
  }

  const boxes = await fetchCSB(docs.flatMap((doc) => doc.boxes))

  return {
    props: {
      redirect,
      // Don't send other pages' source blobs
      docs: docs.map(({ source, ...rest }) => ({ ...rest, source: null! })),
      doc,
      boxes,
    },
  }
}

export const getStaticPaths = async () => {
  const docs = await getDocs()

  const libs = new Set<string>()
  const categories = new Set<string>(['/'])
  const paths = docs.map(({ slug }) => ({ params: { slug } }))

  for (const doc of docs) {
    const [lib, category, page] = doc.slug

    if (!libs.has(lib)) {
      libs.add(lib)
      paths.push({ params: { slug: [lib] } })
    }

    const url = `${lib}/${category}`
    if (page && !categories.has(url)) {
      categories.add(url)
      paths.push({ params: { slug: [lib, category] } })
    }
  }

  return { paths, fallback: false }
}
