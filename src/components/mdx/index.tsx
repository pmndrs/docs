import { MARKDOWN_REGEX } from '@/utils/docs'

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
  <li className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-400">{children}</li>
)

export const p = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 text-base text-gray-700 dark:text-gray-400">{children}</p>
)

export const blockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="mb-8 border-l-4 border-gray-600 pl-4 text-base">{children}</blockquote>
)

export const table = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
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

export const img = ({
  src,
  alt,
  width,
  height,
  ...rest
}: {
  src: string
  alt: string
  width: number
  height: number
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    decoding="async"
    loading="lazy"
    alt={alt}
    width={width}
    height={height}
    {...rest}
  />
)
