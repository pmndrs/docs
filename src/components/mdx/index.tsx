export * from './Code'
// export * from './Codesandbox'
export * from './Details'
export * from './Entries'
export * from './Gha'
export * from './Grid'
export * from './Hint'
export * from './Iframe'
export * from './Img'
export * from './Intro'
export * from './Keypoints'
export * from './Mermaid'
export * from './People'
export * from './Sandpack'
export * from './Summary'
export * from './Toc'

import cn from '@/lib/cn'
import { MARKDOWN_REGEX } from '@/utils/docs'
import { ComponentProps } from 'react'
import { Img } from './Img'

type Hn = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
function Heading({ id, Tag, ...props }: { id?: string; Tag: Hn } & ComponentProps<Hn>) {
  return (
    <a
      href={`#${id}`}
      className="tracking-light my-6 mt-8 block text-balance text-3xl font-bold text-on-surface no-underline hover:underline"
    >
      <Tag id={id} {...props} />
    </a>
  )
}
export const h1 = (props: ComponentProps<'h1'>) => <></>
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

export const ul = ({ className, ...props }: ComponentProps<'ul'>) => (
  <div className={cn('my-4 mb-8', className)}>
    <ul className="ms-6 list-disc" {...props} />
  </div>
)
export const ol = ({ className, ...props }: ComponentProps<'ol'>) => (
  <div className={cn('my-4 mb-8', className)}>
    <ol className="ms-6 list-decimal" {...props} />
  </div>
)
export const li = (props: ComponentProps<'li'>) => <li className="my-1" {...props} />

export const p = (props: ComponentProps<'p'>) => <p className="my-4" {...props} />

export const hr = (props: ComponentProps<'hr'>) => (
  <hr className="my-4 mb-8 border-outline-variant/50" {...props} />
)

export const blockquote = ({ children, className, ...props }: ComponentProps<'blockquote'>) => (
  <blockquote className={cn('my-8 border-l-4 pl-4 text-base', className)} {...props}>
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

export const a = ({ href, target, rel, className, ...props }: ComponentProps<'a'>) => {
  const isAnchor = href?.startsWith('https://')
  target = isAnchor ? '_blank' : target
  rel = isAnchor ? 'noopener noreferrer' : rel
  href = isAnchor ? href : href?.replace(MARKDOWN_REGEX, '')

  return (
    <a {...props} href={href} target={target} rel={rel} className={cn(className, 'text-primary')} />
  )
}

export const img = Img

export const code = (props: ComponentProps<'code'>) => (
  <code
    className="bg-surface-container-high rounded-md px-1.5 py-0.5 font-mono text-[85%]"
    {...props}
  />
)
