import Image from 'next/image'

import clsx from 'clsx'
import { cache } from 'react'

export type CSB = {
  id: string
  title: string
  screenshot_url: string
  description: string
  tags: string[]
}

export default function Codesandbox({
  id,
  title = '',
  description = '',
  screenshot_url,
  tags = [],
  //
  hideTitle = false,
  embed = false,
}: CSB & {
  hideTitle: boolean
  embed: boolean
}) {
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
        <a href={`https://codesandbox.io/s/${id}`} target="_blank" rel="noreferrer">
          {screenshot_url && (
            <Image
              className="rounded-lg"
              src={screenshot_url}
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
          <h6 className="mt-4 font-bold text-gray-700">{title}</h6>
          <p className="mt-1 text-gray-700">{description}</p>
          <div className="w-full">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={clsx(
                  'mt-2 inline-block rounded bg-gray-100 px-1 py-1 text-xs text-gray-500',
                  i !== tags.length - 1 && 'mr-1',
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

async function _fetchCSB(...ids: string[]) {
  // console.log('fetchCSB', ids)

  const boxes: Record<string, CSB> = {}

  const slimData = await fetch('https://codesandbox.io/api/v1/sandboxes/mslim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  }).then((res) => res.json())
  // {
  //   id: 'rrppl0y8l4',
  //   version: 528,
  //   title: 'Basic demo',
  //   sha: '505B382B5A8709DCC7E28826276B9C841F2C728B24E689F775EA4655F1791F6D',
  //   template: 'create-react-app',
  //   v2: false,
  //   always_on: false,
  //   inserted_at: '2019-03-12T10:13:13',
  //   updated_at: '2024-02-22T11:08:26',
  //   git: null,
  //   privacy: 0,
  //   removed_at: null,
  //   source_id: '1be3ace1-849d-4ef9-b96f-1becfd99c5a5',
  //   is_sse: false
  // }
  // console.log('slimData', slimData)

  for (const { id, title } of slimData) {
    boxes[id] = {
      id,
      title,
      description: '',
      screenshot_url: `https://codesandbox.io/api/v1/sandboxes/${id}/screenshot.png`,
      tags: [],
    }
  }

  return boxes
}

export const fetchCSB = cache(_fetchCSB)
