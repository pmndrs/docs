import * as React from 'react'
import type { GetStaticProps } from 'next'
import type libs from 'data/libraries'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import Post from 'components/Post'
import { Doc, DocsContext } from 'hooks/useDocs'
import { type CSB, CSBContext, fetchCSB } from 'hooks/useCSB'
import { getDocs } from 'utils/docs'
import { useIsomorphicLayoutEffect } from 'hooks/useIsomorphicLayoutEffect'
import { NavList } from 'components/Nav'

export interface PostPageProps {
  doc: Doc
  boxes: CSB[]
  nav: NavList
}

export default function PostPage({ doc, boxes: initialBoxes, nav }: PostPageProps) {
  const [docs, setDocs] = React.useState<Doc[]>([])
  const [boxes, setBoxes] = React.useState<CSB[]>(initialBoxes)

  useIsomorphicLayoutEffect(() => {
    fetch('/api/get-docs').then(async (res) => res.ok && setDocs(await res.json()))
    fetch('/api/get-boxes').then(async (res) => res.ok && setBoxes(await res.json()))
  }, [])

  return (
    <DocsContext.Provider value={docs}>
      <CSBContext.Provider value={boxes}>
        <Layout doc={doc} nav={nav}>
          <SEO />
          <main className="max-w-3xl mx-auto">
            <div className="pb-6 mb-4 border-b post-header">
              <h1 className="mb-4 text-5xl font-bold tracking-tighter">{doc.title}</h1>
              {!!doc.description?.length && (
                <p className="text-base leading-4 text-gray-400 leading-5">{doc.description}</p>
              )}
            </div>
            <main className="content-container">
              <Post compiled={doc.compiled} />
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
  const doc = docs.find((doc) => doc.url === url)

  if (!doc) {
    const alternate = docs.find((doc) => doc.url.startsWith(url))
    return alternate
      ? { redirect: { permanent: false, destination: alternate.url } }
      : { notFound: true }
  }

  const boxes = await fetchCSB(doc.boxes)

  const nav = docs.reduce((acc, { slug, title, url }) => {
    const [, ...rest] = slug
    const [page, category] = rest.reverse()

    const entry = { title, url }

    if (category) {
      acc[category] ??= {}
      // @ts-ignore
      acc[category][page] = entry
    } else {
      acc[page] = entry
    }

    return acc
  }, {} as NavList)

  return {
    props: { doc, boxes, nav },
    revalidate: 300,
  }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs()).map(({ slug }) => ({ params: { slug } }))
  return { paths, fallback: 'blocking' }
}
