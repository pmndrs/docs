import { CodesandboxIcon } from '@/components/brand-icons'
import { Img } from '@/components/mdx/Img'

import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export type CSB = {
  id: string
  title?: string
  /**
   * Preview image: a path relative to the page (resolved like an `<img src>`), or a full URL.
   * Without one, a placeholder stands in: CodeSandbox no longer serves sandbox screenshots.
   */
  img?: string
  /** @deprecated Use `img` */
  screenshot_url?: string
  description?: string
  tags?: string[]
}

type CodesandboxProps = CSB & {
  embed?: boolean
} & ComponentProps<'a'>

export function sandboxUrl(id: string) {
  return `https://codesandbox.io/s/${id}`
}

export function Codesandbox({
  id,
  title,
  description,
  img,
  screenshot_url,
  tags = [],
  //
  embed = false,
  className,
}: CodesandboxProps) {
  const src = img ?? screenshot_url

  return (
    <>
      {embed ? (
        <iframe
          src={`https://codesandbox.io/embed/${id}`}
          className="h-125 w-full"
          title={title}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      ) : (
        <a
          href={sandboxUrl(id)}
          target="_blank"
          rel="noreferrer"
          aria-label={title || `CodeSandbox ${id}`}
          className={cn('mb-2 block', className)}
        >
          {src ? (
            <Img src={src} alt={title || ''} className="aspect-video w-full object-cover" />
          ) : (
            <span className="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
              <CodesandboxIcon className="size-12" aria-hidden />
            </span>
          )}
        </a>
      )}

      {title && (
        <>
          <h6 className={cn('mt-2 text-xs text-on-surface-variant')}>{title}</h6>
          {description && <p className={cn('mt-1')}>{description}</p>}
          {tags.length > 0 && (
            <div>
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={cn(
                    'mt-2 inline-block rounded px-1 py-1 text-xs',
                    i !== tags.length - 1 && 'mr-1',
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
