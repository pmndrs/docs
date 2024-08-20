import cn from '@/lib/cn'
import { MARKDOWN_REGEX } from '@/utils/docs'
import { ComponentProps, ReactNode } from 'react'

export * from './Grid'
export * from './Hint'

type Hn = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
function Heading({ id, Tag, ...props }: { id: string; Tag: Hn } & ComponentProps<Hn>) {
  return (
    <a
      href={`#${id}`}
      className="tracking-light mb-6 mt-8 block text-3xl font-bold text-on-surface no-underline hover:underline"
    >
      <Tag id={id} {...props} />
    </a>
  )
}
export const h2 = ({ id, ...props }: Omit<ComponentProps<typeof Heading>, 'Tag'>) => (
  <Heading id={id} Tag="h2" {...props} />
)
export const h3 = ({ id, ...props }: Omit<ComponentProps<typeof Heading>, 'Tag'>) => (
  <Heading id={id} Tag="h3" {...props} />
)
export const h4 = ({ id, ...props }: Omit<ComponentProps<typeof Heading>, 'Tag'>) => (
  <Heading id={id} Tag="h4" {...props} />
)
export const h5 = ({ id, ...props }: Omit<ComponentProps<typeof Heading>, 'Tag'>) => (
  <Heading id={id} Tag="h5" {...props} />
)
export const h6 = ({ id, ...props }: Omit<ComponentProps<typeof Heading>, 'Tag'>) => (
  <Heading id={id} Tag="h6" {...props} />
)

export const ul = (props: ComponentProps<'ul'>) => <ul className="mb-8 px-4" {...props} />
export const ol = (props: ComponentProps<'ol'>) => <ol className="mb-8 px-4" {...props} />
export const li = (props: ComponentProps<'li'>) => (
  <li
    className={cn(
      'my-2 mb-4 text-base leading-6',
      'before:mr-3 before:inline-block before:content-["—"]',
    )}
    {...props}
  />
)

export const p = (props: ComponentProps<'p'>) => <p className="mb-4 text-base" {...props} />

export const blockquote = ({ children }: ComponentProps<'blockquote'>) => (
  <blockquote className="mb-8 border-l-4 pl-4 text-base">
    <div className="text-on-surface-variant/50">{children}</div>
  </blockquote>
)

export const table = (props: ComponentProps<'table'>) => (
  <div className="my-8 overflow-auto rounded-lg border border-outline-variant">
    <table
      className="bg-surface-container-low min-w-full divide-y divide-outline-variant"
      {...props}
    />
  </div>
)

export const thead = (props: ComponentProps<'thead'>) => (
  <thead className="text-on-surface-variant/50" {...props} />
)

export const th = (props: ComponentProps<'th'>) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide" {...props} />
)

export const tr = (props: ComponentProps<'tr'>) => <tr className="even:bg-surface" {...props} />

export const td = (props: ComponentProps<'td'>) => (
  <td className="px-6 py-4 text-sm first:font-medium" {...props} />
)

export const a = ({ href, target, rel, ...props }: ComponentProps<'a'>) => {
  const isAnchor = href?.startsWith('https://')
  target = isAnchor ? '_blank' : target
  rel = isAnchor ? 'noopener noreferrer' : rel
  href = isAnchor ? href : href?.replace(MARKDOWN_REGEX, '')

  return <a {...props} href={href} target={target} rel={rel} className="text-primary" />
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

export const code = (props: ComponentProps<'code'>) => (
  <code
    className="bg-surface-container-high rounded-md px-1.5 py-0.5 font-mono text-[85%]"
    {...props}
  />
)

export const details = (props: ComponentProps<'details'>) => <details className="ml-4" {...props} />
export const summary = (props: ComponentProps<'summary'>) => (
  <summary className="-ml-4 mb-2 cursor-pointer select-none" {...props} />
)
