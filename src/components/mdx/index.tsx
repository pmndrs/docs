import { MARKDOWN_REGEX } from '@/utils/docs'

export * from './Grid'
export * from './Hint'

export const h2 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading text-3xl mb-6 mt-8 tracking-light">
    <h2 id={id}>{children}</h2>
  </a>
)
export const h3 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading text-xl mb-4 mt-6 tracking-light">
    <h3 id={id}>{children}</h3>
  </a>
)
export const h4 = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <a href={`#${id}`} className="heading text-base mb-4 mt-4 tracking-light">
    <h4 id={id}>{children}</h4>
  </a>
)

export const ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="px-4 mb-8">{children}</ul>
)
export const ol = ({ children }: { children: React.ReactNode }) => (
  <ol className="px-4 mb-8">{children}</ol>
)
export const li = ({ children }: { children: React.ReactNode }) => (
  <li className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-400">{children}</li>
)

export const p = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 text-base text-gray-700 dark:text-gray-400">{children}</p>
)

export const blockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="mb-8 text-base pl-4 border-l-4 border-gray-600">{children}</blockquote>
)

export const table = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col my-6">
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-gray-700">
          <table className="divide-y divide-gray-200 w-full dark:divide-gray-700">{children}</table>
        </div>
      </div>
    </div>
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
