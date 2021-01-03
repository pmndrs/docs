import fs from 'fs'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import path from 'path'
import { getDocsPaths, DOCS_PATH } from 'utils/mdxUtils'
import recursiveReaddir from 'recursive-readdir';
import makeNav from 'lib/getSidebarNav'
import Layout from 'components/Layout'

const components = {
  Callout: ({children}) => children,
  Bleed: ({children}) => children
}

export default function PostPage({ source, nav, frontMatter }) {
  const content = hydrate(source, { components })
  return (
    <Layout nav={nav}>
      <div className="post-header">
        <h1>{frontMatter.title}</h1>
        {frontMatter.description && (
          <p className="description">{frontMatter.description}</p>
        )}
      </div>
      <main>{content}</main>
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(DOCS_PATH, `${params.slug.join('/')}.mdx`)
  const source = fs.readFileSync(postFilePath)
  const { content, data } = matter(source)
  const nav = makeNav((await getDocsPaths()).map(x => x.replace('/docs/', '').replace('.mdx', '')))

  const mdxSource = await renderToString(content, {
    components,
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  })

  return {
    props: {
      nav,
      source: mdxSource,
      frontMatter: data,
    },
  }
}

export const getStaticPaths = async () => {
  const paths = (await getDocsPaths())
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    .map((path) => path.replace("/docs/", ''))
    // Map the path into the static paths object required by Next.js
    .map((path) => {
      return { 
        params: { 
          slug:  path.split('/')
        } 
      }
    })

  return {
    paths,
    fallback: false,
  }
}
