import fs from 'fs'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import path from 'path'
import slugify from '@sindresorhus/slugify'

import { getDocsPaths, getAllDocs, DOCS_PATH } from 'utils/mdxUtils'

import Layout from 'components/Layout'
import Codesandbox from 'components/Codesandbox'

import withCodesandbox from 'remark/withCodesandbox'
import setValue from 'set-value'

const components = {
  Callout: ({ children }) => children,
  Bleed: ({ children }) => children,
  Link: () => <a href="#">hey</a>,
  Codesandbox,
  Heading: ({ children, id, level }) => {
    const Comp = level === 2 ? 'h2' : 'h3'

    return (
      <a href={`#${id}`}>
        <Comp id={id}>{children}</Comp>
      </a>
    )
  },
  inlineCode: ({ children }) => {
    return <code className="text-purple-300 bg-purple-100">{children}</code>
  },
}

export default function PostPage({ toc, source, allDocs, nav, frontMatter }) {
  const content = hydrate(source, { components })

  return (
    <Layout nav={nav} toc={toc} allDocs={allDocs}>
      <main className="max-w-3xl mx-auto">
        {frontMatter.title && (
          <div className="pb-6 mb-12 border-b post-header">
            <h1 className="mb-4 text-4xl font-bold">{frontMatter.title}</h1>
            {frontMatter.description && (
              <p className="text-xl font-light text-gray-400">{frontMatter.description}</p>
            )}
          </div>
        )}
        <div className="prose max-w-none">{content}</div>
      </main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(DOCS_PATH, `${params.slug.join('/')}.mdx`)
  const source = fs.readFileSync(postFilePath)
  const { content, data } = matter(source)

  const allDocs = await getAllDocs()

  const nav = allDocs.reduce((nav, file) => {
    const [lib, ...rest] = file.url.replace('/docs/', '').split('/')
    const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`

    setValue(nav, _path, file)
    return nav
  }, {})

  const toc = []
  const mdxSource = await renderToString(content, {
    components,
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [
        withCodesandbox,
        () =>
          function makeTOC(tree) {
            // @ts-ignore
            for (let i = 0; i < tree.children.length; i++) {
              const node = tree.children[i]
              if (node.type === 'heading' && [2, 3].includes(node.depth)) {
                const title = node.children
                  .filter((n) => n.type === 'text')
                  .map((n) => n.value)
                  .join('')

                const slug = slugify(title)

                node.type = 'jsx'
                node.value = `<Heading id={"${slug}"} level={${node.depth}}>${title}</Heading>`

                toc.push({ slug, title, depth: node.depth })
              }
            }

            return tree
          },
      ],
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
  const paths = (await getDocsPaths())
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    .map((path) => path.replace('/docs/', ''))
    // Map the path into the static paths object required by Next.js
    .map((path) => {
      return {
        params: {
          slug: path.split('/'),
        },
      }
    })

  return {
    paths,
    fallback: false,
  }
}
