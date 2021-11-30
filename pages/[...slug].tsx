import { MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import components from 'components/mdx'
import SEO from 'components/Seo'
import prism from 'remark-prism'
import { TOCItem, withCodesandbox, withTableofContents } from 'utils/remark'
import { useRouter } from 'next/router'
import useDocs, { Doc } from 'hooks/useDocs'
import { useRef, useEffect, useLayoutEffect } from 'react'
import { getAllDocs, getDocs, getNavItems, NavItems } from 'utils/docs'
import { GetStaticPaths, GetStaticProps } from 'next'

interface PostProps {
  allDocs: Doc[]
  nav: NavItems
  toc: TOCItem[]
  data: Doc['data']
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

function Post({ allDocs, nav, toc, data, source }: Partial<PostProps>) {
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

interface PostPageProps extends Partial<PostProps> {
  redirect?: string
}

export default function PostPage({ redirect, ...rest }: PostPageProps) {
  const router = useRouter()

  useLayoutEffect(() => {
    if (redirect) return void router.push(redirect)
  }, [redirect, router])

  return redirect ? null : <Post {...rest} />
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  // Get docs' category information from url
  const [lib, page] = params.slug as string[]

  // Check for post and handle redirects on no match
  const docs = await getDocs(lib)
  const post = docs.find((doc) => doc.slug.join('/') === (params.slug as string[]).join('/'))
  if (!post) {
    // Redirect /lib to /lib/first-page
    const firstPage = docs[0]
    if (!page) return { props: { redirect: firstPage.url } }

    // Redirect /lib/category to /lib/category/first-page
    const rootPage = docs.find((doc) => doc.slug.join('/').startsWith(`${lib}/${page}`))
    return { props: { redirect: rootPage.url } }
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
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getAllDocs()
  const paths = docs.reduce((acc, { slug }) => {
    // Get lib and category from slug
    const [lib, ...rest] = slug
    const [, category] = rest.reverse()

    // Add fallback pages for /lib redirects
    const libFallback = { params: { slug: [lib] } }
    if (lib && !acc.includes(libFallback)) acc.push(libFallback)

    // Add fallback pages for /lib/category redirects
    const categoryFallback = { params: { slug: [lib, category] } }
    if (category && !acc.includes(categoryFallback)) acc.push(categoryFallback)

    // Add page
    acc.push({ params: { slug } })

    return acc
  }, [])

  return { paths, fallback: false }
}
