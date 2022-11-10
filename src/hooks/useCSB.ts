import * as React from 'react'

export interface CSB {
  title: string
  description: string
  screenshot_url: string
  tags: string[]
}

export const CSBContext = React.createContext<Record<string, CSB>>({})

export async function fetchCSB(ids: string[]) {
  const boxes: Record<string, CSB> = {}

  let failed = 0

  for (const id of ids) {
    try {
      const { title, description, screenshot_url, tags } = await fetch(
        `https://codesandbox.io/api/v1/sandboxes/${id}`
      ).then(async (res) => (await res.json()).data)

      boxes[id] = { title, description, screenshot_url, tags }
    } catch (_) {
      failed++
      boxes[id] = { title: '', description: '', screenshot_url: '', tags: [] }
    }
  }

  if (failed) console.warn(`fetchCSB: couldn't fetch ${failed}/${ids.length} boxes`)

  return boxes
}

export function useCSB() {
  return React.useContext(CSBContext)
}
