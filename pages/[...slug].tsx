import { MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import components from 'components/mdx'
import SEO from 'components/Seo'
import prism from 'remark-prism'
import { TOCItem, withCodesandbox, withTableofContents } from 'utils/remark'
import { useRouter } from 'next/router'
import useDocs, { Doc } from 'hooks/useDocs'
import { useRef, useEffect } from 'react'
import { getAllDocs, getDocs, getNavItems, NavItems } from 'utils/docs'
import { GetStaticPaths, GetStaticProps } from 'next'

interface PostPageProps {
  allDocs: Doc[]
  nav: NavItems
  toc: TOCItem[]
  data: Doc['data']
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

export default function PostPage({ allDocs, nav, toc, data, source }: PostPageProps) {
  const contentRef = useRef()
  const { query } = useRouter()
  const { setDocs, setCurrentDocs } = useDocs()
  const [lib] = query.slug as string[]

  useEffect(() => {
    setDocs(allDocs)
    setCurrentDocs(lib)
  }, [allDocs, lib, setCurrentDocs, setDocs])

  return (
    <Layout contentRef={contentRef} nav={nav} toc={toc}>
      <SEO lib={lib} />
      <main className="max-w-3xl mx-auto">
        {data.title && (
          <div className="pb-6 mb-4 border-b post-header">
            <h1 className="mb-4 text-5xl font-bold tracking-tighter">{data.title}</h1>
            {data.description && (
              <p className="text-base leading-4 text-gray-400 leading-5">{data.description}</p>
            )}
          </div>
        )}
        <main ref={contentRef} className="content-container">
          <MDXRemote {...source} components={components} />
        </main>
      </main>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  // Get docs' category information from url
  const [lib, ...rest] = params.slug as string[]
  const [page, category] = rest.reverse()

  const docs = await getDocs(lib, false)
  if (!docs) return { notFound: true }

  // Check for post and handle redirects on no match
  const post = docs.find((doc) => doc.slug.join('/') === (params.slug as string[]).join('/'))
  if (!post) {
    // Redirect /lib to /lib/first-page
    const firstPage = docs[0]
    if (!page) return { redirect: { destination: firstPage.url, permanent: false } }

    // Redirect /lib/category to /lib/category/first-page
    const rootPage = docs.find((doc) => doc.slug.join('/').startsWith(`${lib}/${page}`))
    if (!category && rootPage) return { redirect: { destination: rootPage.url, permanent: false } }

    // No matches, return 404
    return { notFound: true }
  }

  const allDocs = await getAllDocs()
  const nav = getNavItems(allDocs)

  const { content, data } = post
  const toc: TOCItem[] = []

  const source = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [prism, withCodesandbox, withTableofContents(toc)],
      rehypePlugins: [],
    },
    scope: data,
  })

  return {
    props: {
      allDocs,
      nav,
      toc,
      source,
      data,
    },
    revalidate: 300, // 5 min
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getAllDocs()
  const paths = docs.map(({ slug }) => ({ params: { slug } }))

  return { paths, fallback: 'blocking' }
}
