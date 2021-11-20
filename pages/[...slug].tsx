import matter from 'gray-matter'
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
// import { data } from 'data/libraries'

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
                {...source}
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

// const settings = data.reduce(
//   (acc, { id, dir = 'markdown' }) => ({
//     ...acc,
//     [id]: {
//       dir,
//     },
//   }),
//   {}
// )

const settings: { [key: string]: { dir: string; tag?: string } } = {
  'react-three-fiber': {
    dir: 'markdown',
    tag: 'docs-remote',
  },
}

const cachedPages = new Map()

const getPages = async (lib: keyof typeof settings) => {
  const cached = cachedPages.get(lib)
  if (cached) return cached

  const { dir, tag = 'master' } = settings[lib]

  const { tree } = await fetch(
    `https://api.github.com/repos/pmndrs/${lib}/git/trees/${tag}?recursive=1`
  ).then((res) => res.json())

  const isMarkdown = ({ path }) => path.startsWith(`${dir}/`) && /\.mdx?$/.test(path)

  const pages = (
    await Promise.all(
      tree.filter(isMarkdown).map(async ({ path }) => {
        const localPath = path
          .toLowerCase()
          .replace(`${dir}/`, '')
          .replace(/\.mdx?$/, '')

        const postData = await fetch(
          `https://raw.githubusercontent.com/pmndrs/${lib}/${tag}/${path}`
        ).then((res) => res.text())
        const { content, data } = matter(postData)

        const slug = [lib, ...localPath.split('/')]
        const url = `/${slug.join('/')}`
        const pathname = slug[slug.length - 1]

        const title = data.title || pathname.replace(/\-/g, ' ')
        const description = data.description ? await serialize(data.description) : ''
        const nav = data.nav ?? Infinity

        return { slug, url, title, description, nav, content, frontMatter: data }
      })
    )
  ).sort((a: any, b: any) => (a.nav > b.nav ? 1 : -1))

  cachedPages.set(lib, pages)

  return pages
}

const getAllPages = async () => {
  const libs = Object.keys(settings)
  const pages = await Promise.all(libs.map(getPages))

  return pages.flat()
}

export const getStaticPaths = async () => {
  const pages = await getAllPages()
  const paths = pages.map(({ slug }) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const [lib] = params.slug
  const pages = await getPages(lib)

  const post = pages.find((page) => page.slug.join('/') === params.slug.join('/'))
  const { content, frontMatter } = post

  const allDocs = await getAllPages()

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
    scope: frontMatter,
  })

  return {
    props: {
      allDocs,
      nav,
      toc,
      source,
      frontMatter,
    },
  }
}
