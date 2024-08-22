import { cache } from 'react'
import { CSB } from './Codesandbox'

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
