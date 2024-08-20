import cn from '@/lib/cn'
import { MARKDOWN_REGEX } from '@/utils/docs'
import { ComponentProps } from 'react'

export * from './Grid'
export * from './Hint'

export const h2 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading tracking-light mb-6 mt-8 text-3xl">
    <h2 id={id}>{children}</h2>
  </a>
)
export const h3 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading tracking-light mb-4 mt-6 text-xl">
    <h3 id={id}>{children}</h3>
  </a>
)
export const h4 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading tracking-light mb-4 mt-4 text-base">
    <h4 id={id}>{children}</h4>
  </a>
)

export const ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="mb-8 px-4">{children}</ul>
)
export const ol = ({ children }: { children: React.ReactNode }) => (
  <ol className="mb-8 px-4">{children}</ol>
)
export const li = ({ children }: { children: React.ReactNode }) => (
  <li
    className={cn(
      'mb-4 text-base leading-6',
      // 'text-gray-700 dark:text-gray-400'
    )}
  >
    {children}
  </li>
)

export const p = ({ children }: { children: React.ReactNode }) => (
  <p
    className={cn(
      'mb-4 text-base',
      // 'text-gray-700 dark:text-gray-400'
    )}
  >
    {children}
  </p>
)

export const blockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote
    className={cn(
      'mb-8 border-l-4 pl-4 text-base',
      // "border-gray-600"
    )}
  >
    {children}
  </blockquote>
)

export const table = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 overflow-auto rounded-lg border border-outline-variant">
    <table className="min-w-full divide-y divide-outline-variant">{children}</table>
  </div>
)

export const a = ({
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
}

export const img = ({ src, alt, width, height, className, ...rest }: ComponentProps<'img'>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    decoding="async"
    loading="lazy"
    alt={alt}
    width={width}
    height={height}
    className={cn('bg-surface-container', className)}
    {...rest}
  />
)
