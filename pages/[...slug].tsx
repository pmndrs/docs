import fs from 'fs'
import Head from 'next/head'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import path from 'path'
import { getDocsPaths, getAllDocs, DOCS_PATH } from 'utils/mdxUtils'
import Layout from 'components/Layout'
import components from 'components/mdx'
import prism from 'remark-prism'
import withCodesandbox from 'remark/withCodesandbox'
import withTableofContents from 'remark/withTableofContents'
import setValue from 'set-value'
import { useRouter } from 'next/router'
import titleCase from 'utils/titleCase'

const SEO = {
  'react-spring': {
    title: 'React Spring',
    image: 'https://docs.pmnd.rs/react-spring/share,jpg',
    description: 'Bring your components to life with simple spring animation primitives for React',
  },
  'react-three-fiber': {
    title: 'React Three Fiber',
    // image: "https://docs.pmnd.rs/react-spring/share,jpg",
    description: 'React-three-fiber is a React renderer for three.js.',
  },
  drei: {
    title: 'Drei',
    image: 'https://docs.pmnd.rs/logo-drei.jpg',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber.',
  },
}

export default function PostPage({ toc, source, allDocs, nav, frontMatter }) {
  const content = hydrate(source, { components })
  const { query } = useRouter()
  const currentSeo = SEO[query.slug[0]]

  return (
    <Layout nav={nav} toc={toc} allDocs={allDocs}>
      <Head>
        <title> {currentSeo.title} Documentation</title>
        <meta property="og:site_name" content={`${currentSeo.title} Documentation`} />
        <meta name="description" content={currentSeo.description} />
        <meta property="og:url" content={`https://docs.pmnd.rs/${query.slug[0]}`}></meta>
        <meta property="og:image" content={currentSeo.image} />
      </Head>
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
