import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from 'components/Layout'
import components from 'components/mdx'
import Seo from 'components/Seo'
import prism from 'remark-prism'
import withCodesandbox from 'remark/withCodesandbox'
import withTableofContents from 'remark/withTableofContents'
import setValue from 'set-value'
import { useRouter } from 'next/router'
import { useDocs } from 'store/docs'
import { useEffect } from 'react'
import { getAllDocs, getDocs } from 'utils/docs'

export default function PostPage({ toc, source, allDocs, nav, frontMatter }) {
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
        {frontMatter.title && (
          <div className="pb-6 mb-4 border-b post-header">
            <h1 className="mb-4 text-5xl font-bold tracking-tighter">{frontMatter.title}</h1>
            {frontMatter.description && (
              <MDXRemote
                {...frontMatter.description}
                components={{
                  ...components,
                  p: ({ children }) => (
                    <p className="text-base leading-4 text-gray-400 leading-5">{children}</p>
                  ),
                }}
              />
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
  const [lib] = params.slug
  const docs = await getDocs(lib)

  const post = docs.find((doc) => doc.slug.join('/') === params.slug.join('/'))
  const { content, data } = post

  const allDocs = await getAllDocs()

  const nav = allDocs.reduce((nav, file) => {
    const [lib, ...rest] = file.slug
    const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`
    setValue(nav, _path, file)
    return nav
  }, {})

  const toc = []
  const source = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [prism, withCodesandbox, withTableofContents(toc)],
      rehypePlugins: [],
    },
    scope: data,
  })

  // Also serialize descriptions
  const description = data.description ? await serialize(data.description) : null
  const frontMatter = { ...data, description }

  return {
    props: {
      allDocs,
      nav,
      toc,
      source,
      frontMatter,
    },
    revalidate: 300, // 5 min
  }
}

export const getStaticPaths = async () => {
  const docs = await getAllDocs()
  const paths = docs.map(({ slug }) => ({ params: { slug } }))

  return { paths, fallback: 'blocking' }
}
