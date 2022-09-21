import * as React from 'react'
import Codesandbox from 'components/Codesandbox'
import { MDXRemoteProps, MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote'
import { MARKDOWN_REGEX } from 'utils/docs'

const components = {
  Codesandbox,
  Hint: ({ children }: { children: React.ReactNode }) => (
    <div className="hint shadow overflow-hidden bg-yellow-100 border-b border-gray-200 sm:rounded-lg px-6 py-4 mb-6">
      {children}
    </div>
  ),
  Grid: ({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) => (
    <ul
      className={`grid sm:grid-cols-2 ${
        cols === 4
          ? 'md:grid-cols-4'
          : cols === 3
          ? 'md:grid-cols-3'
          : cols === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1'
      } gap-4 text-sm text-gray-700 grid-list`}
      style={{ marginBottom: '1rem' }}
    >
      {children}
    </ul>
  ),
  h2: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-3xl mb-6 mt-8 tracking-light">
      <h2 id={id}>{children}</h2>
    </a>
  ),
  h3: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-xl mb-4 mt-6 tracking-light">
      <h3 id={id}>{children}</h3>
    </a>
  ),
  h4: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-base mb-4 mt-4 tracking-light">
      <h4 id={id}>{children}</h4>
    </a>
  ),
  ul: ({ children }: { children: React.ReactNode }) => <ul className="px-4 mb-8">{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol className="px-4 mb-8">{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-4 text-base leading-6 text-gray-700">{children}</li>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-base text-gray-700">{children}</p>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-8 text-base pl-4 border-l-4 border-gray-600">{children}</blockquote>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col my-6">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="divide-y divide-gray-200 w-full">{children}</table>
          </div>
        </div>
      </div>
    </div>
  ),
  a: ({
    href,
    target,
    rel,
    children,
  }: {
    href: string
    target?: string
    rel?: string
    children: React.ReactNode
  }) => {
    const isAnchor = href.startsWith('https://')
    target = isAnchor ? '_blank' : target
    rel = isAnchor ? 'noopener noreferrer' : rel
    href = isAnchor ? href : href.replace(MARKDOWN_REGEX, '')

    return (
      <a href={href} target={target} rel={rel}>
        {children}
      </a>
    )
  },
}

export default function Post(props: MDXRemoteSerializeResult) {
  return <MDXRemote {...props} components={components as MDXRemoteProps['components']} />
}
