import { Img } from '@/components/mdx'

import cn from '@/lib/cn'
import { ComponentProps } from 'react'
import { fetchCSB } from './fetchCSB'

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
          className="h-[500px] w-full"
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
              className={cn('aspect-[16/9] object-cover', imgClassName)}
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

export async function Codesandbox1({ boxes, ...props }: { boxes: string[] } & Codesandbox0Props) {
  const ids = boxes // populated from 1.
  // console.log('ids', ids)

  //
  // Batch fetch all CSBs of the page
  //
  const csbs = await fetchCSB(...ids)
  // console.log('boxes', boxes)
  const data = csbs[props.id]
  // console.log('data', data)

  // Merge initial props with data
  const merged = { ...props, ...data }
  return <Codesandbox0 {...merged} />
}
