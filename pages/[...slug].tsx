import * as React from 'react'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { GetStaticProps } from 'next'
import type libs from 'data/libraries'
import { serialize } from 'next-mdx-remote/serialize'
import gfm from 'remark-gfm'
import prism from 'mdx-prism'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import Post from 'components/Post'
import { useDocs } from 'hooks/useDocs'
import { CSB, CSBContext, fetchCSB } from 'hooks/useCSB'
import { tableOfContents, codesandbox, TocItem } from 'utils/rehype'
import { Doc, getDocs } from 'utils/docs'

export interface PostPageProps {
  docs: Doc[]
  toc: TocItem[]
  boxes: Record<string, CSB>
  title: string
  description?: string
  source: MDXRemoteSerializeResult
}

export default function PostPage({ docs, toc, boxes, title, description, source }: PostPageProps) {
  const { setDocs } = useDocs()

  React.useEffect(() => void setDocs(docs), [setDocs, docs])

  return (
    <Layout toc={toc}>
      <SEO />
      <main className="max-w-3xl mx-auto">
        <div className="pb-6 mb-4 border-b post-header">
          <h1 className="mb-4 text-5xl font-bold tracking-tighter">{title}</h1>
          {!!description?.length && (
            <p className="text-base leading-4 text-gray-400 leading-5">{description}</p>
          )}
        </div>
        <main className="content-container">
          <CSBContext.Provider value={boxes}>
            <Post {...source} />
          </CSBContext.Provider>
        </main>
      </main>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slug = params.slug as string[]
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

  const { title, description, content } = doc

  const toc = []
  const ids = []
  const source = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [gfm],
      rehypePlugins: [prism, tableOfContents(toc), codesandbox(ids)],
    },
  })

  const boxes = await fetchCSB(ids)

  return { props: { docs, toc, boxes, title, description, source }, revalidate: 300 }
}

export const getStaticPaths = async () => {
  const paths = (await getDocs()).map((params) => ({ params }))
  return { paths, fallback: 'blocking' }
}
