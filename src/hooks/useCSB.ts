import * as React from 'react'

export interface CSB {
  title: string
  description: string
  content: string
  screenshot_url: string
  tags: string[]
}

export const CSBContext = React.createContext<Record<string, CSB>>({})

export async function fetchCSB(ids: string[]) {
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

    // try {
    //   const { description, screenshot_url, tags } = await fetch(
    //     `https://codesandbox.io/api/v1/sandboxes/${id}`
    //   ).then(async (res) => (await res.json()).data)

    //   boxes[id] = { title, description, screenshot_url, tags }
    // } catch (_) {
    //   boxes[id] = {
    //     title,
    //     description: '',
    //     screenshot_url: `https://codesandbox.io/api/v1/sandboxes/${id}/screenshot.png`,
    //     tags: [],
    //   }
    // }
  }

  return boxes
}

export function useCSB() {
  return React.useContext(CSBContext)
}
