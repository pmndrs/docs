import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import SEO from 'components/Seo'
import Codesandbox from 'components/Codesandbox'
import clsx from 'clsx'
import useDocs, { Doc } from 'hooks/useDocs'
import prism from 'remark-prism'
import { TOCItem, withTableofContents } from 'utils/remark'
import { getAllDocs, getDocs, getNavItems, NavItems } from 'utils/docs'

interface PostPageProps {
  redirect?: string
  allDocs: Doc[]
  nav: NavItems
  toc: TOCItem[]
  data: Doc['data']
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

const components = {
  Codesandbox,
  Hint: ({ children }) => (
    <div className="shadow overflow-hidden bg-yellow-100 border-b border-gray-200 sm:rounded-lg px-6 py-4 mb-6">
      {children}
    </div>
  ),
  Grid: ({ children, cols = 4 }) => (
    <ul
      className={`grid sm:grid-cols-2 ${
        cols === 4
          ? 'md:grid-cols-4'
          : cols === 3
          ? 'md:grid-cols-3'
          : cols === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1'
      } gap-4 text-sm text-gray-700 grid-list`}
      style={{ marginBottom: '1rem' }}
    >
      {children}
    </ul>
  ),
  Heading: ({ children, id, level, ...rest }) => {
    const headingStyle = {
      2: 'text-3xl mb-6 mt-8',
      3: 'text-xl mb-4 mt-6',
      4: 'text-base mb-4 mt-4',
    }

    const clampedLevel = Math.min(Math.max(level, 2), 4)
    const Comp = `h${clampedLevel}`

    return (
      <a
        href={`#${id}`}
        className={clsx('heading', headingStyle[clampedLevel], 'tracking-tight')}
        {...rest}
      >
        {/* @ts-expect-error */}
        <Comp id={id}>{children}</Comp>
      </a>
    )
  },
  ul: ({ children }) => <ul className="px-4 mb-8">{children}</ul>,
  ol: ({ children }) => <ol className="px-4 mb-8">{children}</ol>,
  li: ({ children }) => <li className="mb-4 text-base leading-6 text-gray-700">{children}</li>,
  inlineCode: ({ children }) => (
    <code className="px-2 py-1 rounded font-mono text-sm text-gray-800 bg-gray-100">
      {children}
    </code>
  ),
  p: ({ children }) => <p className="mb-4 text-base text-gray-700">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mb-8 text-base pl-4 border-l-4 border-gray-600">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="flex flex-col my-6">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="divide-y divide-gray-200 w-full">{children}</table>
          </div>
        </div>
      </div>
    </div>
  ),
  a: ({ href, target, rel, children }) => {
    const isAnchor = href.startsWith('https://')
    target = isAnchor ? '_blank' : target
    rel = isAnchor ? 'noopener noreferrer' : rel

    return (
      <a href={href} target={target} rel={rel}>
        {children}
      </a>
    )
  },
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
      remarkPlugins: [prism, withTableofContents(toc)],
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
