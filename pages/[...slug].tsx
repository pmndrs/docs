import fs from 'fs'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import path from 'path'

import { getDocsPaths, getAllDocs, DOCS_PATH } from 'utils/mdxUtils'

import Layout from 'components/Layout'
import Codesandbox from 'components/Codesandbox'

import prism from 'remark-prism'

import withCodesandbox from 'remark/withCodesandbox'
import withTableofContents from 'remark/withTableofContents'
import setValue from 'set-value'
import clsx from 'clsx'

const components = {
  Callout: ({ children }) => children,
  Bleed: ({ children }) => children,
  Codesandbox,
  Heading: ({ children, id, level }) => {
    const Comp = level === 2 ? 'h2' : 'h3'
    return (
      <a
        href={`#${id}`}
        className={clsx(
          'heading',
          level === 2 ? 'text-3xl mb-6 mt-8' : 'text-xl mb-4 mt-6',
          'tracking-tight'
        )}
      >
        <Comp id={id}>{children}</Comp>
      </a>
    )
  },
  ul: ({ children }) => <ul className="px-4 mb-8">{children}</ul>,
  ol: ({ children }) => <ol className="px-4 mb-8">{children}</ol>,
  li: ({ children }) => <li className="mb-4 text-lg leading-6 text-gray-700">{children}</li>,
  inlineCode: ({ children }) => (
    <code className="px-1 px-2 py-1 font-mono text-sm text-gray-800 bg-gray-100">{children}</code>
  ),
  p: ({ children }) => <p className="mb-4 text-lg leading-8 text-gray-700">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mb-8 text-base leading-8 pl-4 border-l-4 border-gray-600">
      {children}
    </blockquote>
  ),
  table: ({ children }) => {
    return (
      <div className="flex flex-col my-6">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="divide-y divide-gray-200"> {children}</table>
            </div>
          </div>
        </div>
      </div>
    )
  },
  a: (props) => {
    if (props.href.startsWith('https://')) {
      return (
        <a className="text-lg" href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      )
    }
    return (
      <a className="text-lg" href={props.href}>
        {props.children}
      </a>
    )
  },
}

export default function PostPage({ toc, source, allDocs, nav, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <Layout nav={nav} toc={toc} allDocs={allDocs}>
      <main className="max-w-3xl mx-auto">
        {frontMatter.title && (
          <div className="pb-6 mb-12 border-b post-header">
            <h1 className="mb-4 text-6xl font-bold tracking-tighter">{frontMatter.title}</h1>
            {frontMatter.description && (
              <p className="text-lg leading-8 text-gray-400">{frontMatter.description}</p>
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
