import { CopyPage } from '@/components/CopyPage'
import cn from '@/lib/cn'
import { cliCommand, resolveLibKey } from '@/utils/cliCommand'
import { getData, getDocs } from '@/utils/docs'
import { withoutTrailingSlash } from '@/utils/version'

export type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params

  const { doc } = await getData(...slug)

  const title = `${doc.metadata.title} - ${process.env.NEXT_PUBLIC_LIBNAME}`
  const description = doc.metadata.description
  const url = doc.url
  const image = doc.image

  return {
    title,
    description,
    openGraph: {
      title,
      images: [{ url: image }],
      description,
      url,
      type: 'article',
    },
  }
}

export default async function Page({ params }: Props) {
  // console.log('page', params)

  const { slug } = await params

  const { doc } = await getData(...slug) // [ 'getting-started', 'introduction' ]

  // Paths on this site, absolute when the build knows its public URL -- which already includes
  // the base path, as in `llms-full.txt`. The markdown is served by `src/app/md/[...slug]/route.ts`.
  const { NEXT_PUBLIC_URL, NEXT_PUBLIC_LIBNAME, BASE_PATH } = process.env
  const markdownUrl = `${BASE_PATH || ''}/md${doc.url}.md`
  const pageUrl = `${BASE_PATH || ''}${doc.url}`
  const absolutePageUrl = NEXT_PUBLIC_URL
    ? `${withoutTrailingSlash(NEXT_PUBLIC_URL)}${doc.url}`
    : undefined
  const command = cliCommand(resolveLibKey({ url: NEXT_PUBLIC_URL, basePath: BASE_PATH }), doc.url)

  return (
    <>
      <header className={cn('mb-6 mt-8 border-b', 'border-outline-variant/50')}>
        <div className="mb-2 flex items-start gap-4">
          <h1 className="min-w-0 text-5xl font-bold tracking-tighter">{doc.title}</h1>
          {/* Whatever the title leaves, but never less than the icon-only buttons: `CopyPage`
              collapses its label through a container query on this width */}
          <div className="@container mt-2 flex min-w-16 flex-1 justify-end">
            <CopyPage
              markdownUrl={markdownUrl}
              pageUrl={pageUrl}
              absolutePageUrl={absolutePageUrl}
              libname={NEXT_PUBLIC_LIBNAME}
              command={command}
            />
          </div>
        </div>
        {doc.description && (
          <div className={cn('my-2 text-base leading-5', 'text-on-surface-variant/50')}>
            {doc.description}
          </div>
        )}
      </header>
      {doc ? <>{doc.content}</> : 'empty doc'}
    </>
  )
}

export async function generateStaticParams() {
  console.log('generateStaticParams')

  // return [
  //   { slug: ['getting-started', 'introduction'] },
  //   { slug: ['getting-started', 'installation'] },
  //   { slug: ['getting-started', 'your-first-scene'] },
  //   { slug: [ 'getting-started', 'examples' ] },
  //   { slug: [ 'api', 'canvas' ] },
  //   { slug: [ 'api', 'objects' ] },
  //   { slug: [ 'api', 'hooks' ] },
  //   { slug: [ 'api', 'events' ] },
  //   { slug: [ 'api', 'additional-exports' ] },
  //   { slug: [ 'advanced', 'scaling-performance' ] },
  //   { slug: [ 'advanced', 'pitfalls' ] },
  //   { slug: [ 'tutorials', 'v8-migration-guide' ] },
  //   { slug: [ 'tutorials', 'events-and-interaction' ] },
  //   { slug: [ 'tutorials', 'loading-models' ] },
  //   { slug: [ 'tutorials', 'loading-textures' ] },
  //   { slug: [ 'tutorials', 'basic-animations' ] },
  //   { slug: [ 'tutorials', 'using-with-react-spring' ] },
  //   { slug: [ 'tutorials', 'typescript' ] },
  //   { slug: [ 'tutorials', 'testing' ] },
  //   { slug: [ 'tutorials', 'how-it-works' ] }
  // ]

  const MDX = process.env.MDX
  if (!MDX) {
    console.warn('MDX env var not set')
    return []
  }

  const docs = await getDocs(MDX, null, true)
  const paths = docs.map(({ slug }) => ({ slug }))
  // console.log('paths', paths)
  return paths
}
