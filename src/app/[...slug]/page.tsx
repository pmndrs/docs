import cn from '@/lib/cn'
import { getData, getDocs } from '@/utils/docs'

export type Props = {
  params: { slug: string[] }
}

export async function generateMetadata({ params }: Props) {
  const slug = params.slug

  const { doc } = await getData(...slug)

  const title = `${doc.title} - ${process.env.NEXT_PUBLIC_LIBNAME}`
  const description = doc.description
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

  const slug = params.slug

  const { doc } = await getData(...slug) // [ 'getting-started', 'introduction' ]

  return (
    <>
      <div className={cn('my-8 border-b', 'border-outline-variant/50')}>
        <h1 className="text-5xl font-bold tracking-tighter">{doc.title}</h1>
        {!!doc?.description?.length && (
          <p className={cn('my-2 text-base leading-5', 'text-on-surface-variant/50')}>
            {doc.description}
          </p>
        )}
      </div>
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
