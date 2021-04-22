import fs from 'fs'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import path from 'path'
import { getDocsPaths, getAllDocs, DOCS_PATH } from 'utils/mdxUtils'
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

export default function PostPage({ toc, source, allDocs, nav, frontMatter }) {
  const content = hydrate(source, { components })
  const { query } = useRouter()
  const { setDocs, setCurrentDocs } = useDocs()
  const name = query.slug[0]

  useEffect(() => {
    setDocs(allDocs)
    setCurrentDocs(name)
  }, [])

  return (
    <Layout nav={nav} toc={toc}>
      <Seo name={name} />
      <main className="max-w-3xl mx-auto">
        {frontMatter.title && (
          <div className="pb-6 mb-4 border-b post-header">
            <h1 className="mb-4 text-5xl font-bold tracking-tighter">{frontMatter.title}</h1>
            {frontMatter.description && (
              <p className="text-base leading-4 text-gray-400 leading-5">
                {frontMatter.description}
              </p>
            )}
          </div>
        )}
        <div className="content-container">{content}</div>
      </main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(DOCS_PATH, `${path.join(...params.slug)}.mdx`)
  const source = fs.readFileSync(postFilePath)
  const { content, data } = matter(source)
  const allDocs = await getAllDocs()

  const nav = allDocs.reduce((nav, file) => {
    const [lib, ...rest] = file.url.split('/').filter(Boolean)
    const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`
    setValue(nav, _path, file)
    return nav
  }, {})

  const toc = []
  const mdxSource = await renderToString(content, {
    components,
    // Optionally pass remark/rehype plugins
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
      source: mdxSource,
      frontMatter: data,
    },
  }
}

export const getStaticPaths = async () => {
  // Map the path into the static paths object required by Next.js
  const paths = (await getDocsPaths()).map((slug) => ({
    params: {
      slug: slug.split(path.sep).filter(Boolean),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}
