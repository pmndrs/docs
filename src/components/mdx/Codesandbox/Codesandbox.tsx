import { Img } from '@/components/mdx'

import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export type CSB = {
  id: string
  title?: string
  screenshot_url?: string
  description?: string
  tags?: string[]
}

type Codesandbox0Props = CSB & {
  hideTitle?: boolean
  embed?: boolean
} & ComponentProps<'a'> & {
    imgProps?: ComponentProps<'img'>
  }

export function Codesandbox0({
  id,
  title = '',
  description = '',
  screenshot_url,
  tags = [],
  //
  hideTitle = false,
  embed = false,
  className,
  imgProps: { className: imgClassName } = {},
}: Codesandbox0Props) {
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
          href={`https://codesandbox.io/s/${id}`}
          target="_blank"
          rel="noreferrer"
          className={cn('mb-2 block', className)}
        >
          {screenshot_url && (
            <Img
              src={screenshot_url}
              alt={title}
              width={1763}
              height={926}
              className={cn('aspect-video object-cover', imgClassName)}
            />
          )}
        </a>
      )}

      {!hideTitle && (
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

export function Codesandbox1({ boxes: _boxes, ...props }: { boxes: string[] } & Codesandbox0Props) {
  // Directly construct the screenshot URL without fetching from API
  const screenshot_url = `https://codesandbox.io/api/v1/sandboxes/${props.id}/screenshot.png`
  
  // Use props with constructed screenshot URL
  const merged = {
    screenshot_url,
    title: props.title || '',
    description: props.description || '',
    tags: props.tags || [],
    ...props,
  }
  
  return <Codesandbox0 {...merged} />
}
