import * as React from 'react'
import type { GetStaticProps } from 'next'
import type libs from 'data/libraries'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import Post from 'components/Post'
import { Doc, DocsContext } from 'hooks/useDocs'
import { type CSB, CSBContext, fetchCSB } from 'hooks/useCSB'
import { getDocs } from 'utils/docs'

export interface PostPageProps {
  docs: Doc[]
  doc: Doc
  boxes: Record<string, CSB>
}

export default function PostPage({ docs, doc, boxes }: PostPageProps) {
  return (
    <DocsContext.Provider value={docs}>
      <CSBContext.Provider value={boxes}>
        <Layout doc={doc}>
          <SEO />
          <main className="max-w-3xl mx-auto">
            <div className="pb-6 mb-4 border-b dark:border-gray-700 post-header ">
              <h1 className="mb-4 text-5xl font-bold tracking-tighter">{doc.title}</h1>
              {!!doc.description?.length && (
                <p className="text-base text-gray-400 leading-5">{doc.description}</p>
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

  const allDocs = await getDocs(lib, false)
  // console.log('allDocs', allDocs)
  if (!allDocs?.length) return { notFound: true }

  const url = `/${slug.join('/')}`.toLowerCase()
  const theDoc = allDocs.find((doc) => doc.url === url)

  if (!theDoc) {
    const alternate = allDocs.find((doc) => doc.url.startsWith(url))
    return alternate
      ? { redirect: { permanent: false, destination: alternate.url } }
      : { notFound: true }
  }

  const boxes = await fetchCSB(allDocs.flatMap((doc) => doc.boxes))

  //
  // Clean useless datas
  //

  //
  // step 1. Clean `docs`: no source / no tableOfContents (will be provided by `doc` itself)
  //
  const docs = allDocs.map((doc) => ({
    ...doc,
    source: null!,
    tableOfContents: [],
  }))
  // console.log('docs', JSON.stringify(docs, null, 2))

  //
  // Step 2. Clean `doc`: tableOfContents[].content|description => useless
  //
  const noContentNoDesc = (tocItem: Doc['tableOfContents'][number]) => {
    // Recursively clear parent
    if (tocItem.parent) tocItem.parent = noContentNoDesc({ ...tocItem.parent })

    return {
      ...tocItem,
      content: 'NO_CONTENT',
      description: 'NO_DESC',
    }
  }
  const doc = {
    ...theDoc,
    tableOfContents: theDoc.tableOfContents.map(noContentNoDesc), // Clear all content
  }
  // console.log('doc', JSON.stringify(doc, null, 2))

  return {
    props: {
      docs,
      doc,
      boxes,
    },
    revalidate: 3600,
  }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs(undefined, true)).map(({ slug }) => ({ params: { slug } }))
  return { paths, fallback: 'blocking' }
}
