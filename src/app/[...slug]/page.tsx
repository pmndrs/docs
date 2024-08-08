import * as React from 'react'

import SEO from '@/components/Seo'
import Post from '@/components/Post'

import { getData, getDocs } from '@/utils/docs'

export type Props = {
  params: { slug: string[] }
}

export default async function Page({ params }: Props) {
  const slug = params.slug

  const { doc } = await getData(...slug) // [ 'react-three-fiber', 'getting-started', 'introduction' ]

  return (
    <>
      {/* <SEO lib={slug[0]} /> */}
      <div className="max-w-3xl mx-auto">
        <div className="pb-6 mb-4 border-b dark:border-gray-700 post-header ">
          <h1 className="mb-4 text-5xl font-bold tracking-tighter">{doc?.title}</h1>
          {!!doc?.description?.length && (
            <p className="text-base text-gray-400 leading-5">{doc.description}</p>
          )}
        </div>
        <div className="content-container">{doc ? <Post doc={doc} /> : 'empty doc'}</div>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  console.log('generateStaticParams')

  const docs = await getDocs('react-three-fiber')
  const paths = docs.map(({ slug }) => ({ slug }))

  return [
    { slug: ['react-three-fiber', 'getting-started', 'introduction'] },
    { slug: ['react-three-fiber', 'getting-started', 'installation'] },
    { slug: ['react-three-fiber', 'getting-started', 'your-first-scene'] },
    // { slug: [ 'react-three-fiber', 'getting-started', 'examples' ] },
    // { slug: [ 'react-three-fiber', 'api', 'canvas' ] },
    // { slug: [ 'react-three-fiber', 'api', 'objects' ] },
    // { slug: [ 'react-three-fiber', 'api', 'hooks' ] },
    // { slug: [ 'react-three-fiber', 'api', 'events' ] },
    // { slug: [ 'react-three-fiber', 'api', 'additional-exports' ] },
    // { slug: [ 'react-three-fiber', 'advanced', 'scaling-performance' ] },
    // { slug: [ 'react-three-fiber', 'advanced', 'pitfalls' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'v8-migration-guide' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'events-and-interaction' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'loading-models' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'loading-textures' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'basic-animations' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'using-with-react-spring' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'typescript' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'testing' ] },
    // { slug: [ 'react-three-fiber', 'tutorials', 'how-it-works' ] }
  ]
  // return paths
}
