import Image from 'next/image'

import clsx from 'clsx'

export type CSB = {
  title: string
  description: string
  content: string
  screenshot_url: string
  tags: string[]
}

export default function Codesandbox({
  id,
  data,
  embed = false,
  tags: defaultTags,
  description: defaultDescription,
  title: defaultTitle,
  hideTitle = false,
}: {
  id: string
  data: CSB
  embed: boolean
  tags?: string[]
  description?: string
  title?: string
  hideTitle?: boolean
}) {
  const tags = defaultTags || data?.tags || []
  const description = defaultDescription || data?.description || ''
  const title = defaultTitle || data?.title || ''

  return (
    <>
      {embed ? (
        <iframe
          src={`https://codesandbox.io/embed/${id}`}
          className="w-full h-[500px]"
          title={title}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      ) : (
        <a href={`https://codesandbox.io/s/${id}`} target="_blank" rel="noreferrer">
          {data?.screenshot_url && (
            <Image
              className="rounded shadow-lg"
              src={data.screenshot_url}
              placeholder="empty"
              alt={title}
              width={1763}
              height={926}
              loading="lazy"
            />
          )}
        </a>
      )}

      {!hideTitle && (
        <>
          <h6 className="text-gray-700 font-bold mt-4">{title}</h6>
          <p className="text-gray-700 mt-1">{description}</p>
          <div className="w-full">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={clsx(
                  'inline-block mt-2 text-gray-500 bg-gray-100 rounded px-1 py-1 text-xs',
                  i !== tags.length - 1 && 'mr-1'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export async function fetchCSB(ids: string[]) {
  // console.log('fetchCSB', ids)

  const boxes: Record<string, CSB> = {}

  const slimData = await fetch('https://codesandbox.io/api/v1/sandboxes/mslim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  }).then((res) => res.json())

  for (const { id, title } of slimData) {
    boxes[id] = {
      title,
      description: '',
      content: '',
      screenshot_url: `https://codesandbox.io/api/v1/sandboxes/${id}/screenshot.png`,
      tags: [],
    }
  }

  return boxes
}
