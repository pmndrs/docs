import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import components from 'components/mdx'
import prism from 'remark-prism'
import useDocs, { Doc } from 'hooks/useDocs'
import { TOCItem, withCodesandbox, withTableofContents } from 'utils/remark'
import { getAllDocs, getDocs, getNavItems, NavItems } from 'utils/docs'

interface PostPageProps {
  redirect?: string
  allDocs: Doc[]
  nav: NavItems
  toc: TOCItem[]
  data: Doc['data']
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

export default function PostPage({ redirect, allDocs, nav, toc, data, source }: PostPageProps) {
  const contentRef = useRef()
  const router = useRouter()
  const { setDocs, setCurrentDocs } = useDocs()
  const [lib] = router.query.slug as string[]

  useEffect(() => {
    if (redirect) router.replace(redirect, undefined, { shallow: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  let redirect: string = null
  let post: Doc

  // Check for post or find best matches to redirect to
  const docs = await getDocs(lib)
  post = docs.find((doc) => doc.slug.join('/') === (params.slug as string[]).join('/'))
  if (!post) {
    // Redirect /lib to /lib/first-page
    if (!page) {
      post = docs[0]
    }

    // Redirect /lib/category to /lib/category/first-page
    if (!post && !category) {
      post = docs.find((doc) => doc.slug.join('/').startsWith(`${lib}/${page}`))
    }

    // Post was not found, return 404
    if (!post) return { notFound: true }

    // Alternate post was found, tell client to rewrite path
    redirect = post.url
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
      redirect,
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
