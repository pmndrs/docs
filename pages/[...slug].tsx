import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import components from 'components/mdx'
import Seo from 'components/Seo'
import prism from 'remark-prism'
import { withCodesandbox, withTableofContents } from 'utils/remark'
import setValue from 'set-value'
import { useRouter } from 'next/router'
import useDocs from 'hooks/useDocs'
import { useEffect } from 'react'
import { getAllDocs, getDocs } from 'utils/docs'

export default function PostPage({ allDocs, nav, toc, data, source }) {
  const { query } = useRouter()
  const { setDocs, setCurrentDocs } = useDocs()
  const name = query.slug[0]

  useEffect(() => {
    setDocs(allDocs)
    setCurrentDocs(name)
  }, [allDocs, name, setCurrentDocs, setDocs])

  return (
    <Layout nav={nav} toc={toc}>
      <Seo name={name} />
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
          <MDXRemote {...source} components={components} />
        </main>
      </main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  // Get docs' category information from url
  const [lib, ...rest] = params.slug
  const [page, category] = rest.reverse()

  const docs = await getDocs(lib, false)
  if (!docs) return { notFound: true }

  // Check for post and handle redirects
  const post = docs.find((doc) => doc.slug.join('/') === params.slug.join('/'))
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

  const nav = allDocs.reduce((nav, file) => {
    const [lib, ...rest] = file.slug
    const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`
    setValue(nav, _path, file)
    return nav
  }, {})

  const { content, data } = post
  const toc = []

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

export const getStaticPaths = async () => {
  const docs = await getAllDocs()
  const paths = docs.map(({ slug }) => ({ params: { slug } }))

  return { paths, fallback: 'blocking' }
}
