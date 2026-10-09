import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { linkProps } from './Link/linkProps'

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
  <div className="my-8 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
    {/* The fade masks the scroller and everything it paints: the frame stays on the outer div */}
    <div className="overflow-x-auto scroll-fade-x no-scrollbar">
      <table className="min-w-full divide-y divide-outline-variant" {...props} />
    </div>
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

// Underlined, not told apart by colour alone (WCAG 1.4.1): a palette can bring `primary` within a
// hair of the body text — a lime seed with color match puts it at white in dark mode, next to a
// near-white `on-surface`.
export const a = ({ href, target, rel, className, ...props }: ComponentProps<'a'>) => (
  <a
    {...props}
    {...linkProps(href, target, rel)}
    className={cn(
      'text-primary underline underline-offset-3 hover:decoration-2 [&_code]:text-primary',
      className,
    )}
  />
)

// The text role goes with the background role: inherited, the parent's text can be meant for
// another background (on-primary-container, in the sidebar's current page) and vanish on this one
// at high contrast.
// The corner is not a radius token, on purpose: inline code sits in text of any size (a paragraph,
// a heading, a table cell), and `.25em` keeps it in proportion with the letters, where a fixed step
// of the scale (`sm` is 6.375px) would round a small chip in body text into a pill and look square in
// an h1. The 4px floor keeps it visibly rounded in the smallest text.
export const code = (props: ComponentProps<'code'>) => (
  <code
    className="bg-surface-container-high text-on-surface rounded-[max(.25em,4px)] px-1.5 py-0.5 font-mono"
    {...props}
  />
)
