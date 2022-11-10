import * as React from 'react'

export interface CSB {
  title: string
  description: string
  alias: string
  screenshot_url: string
  tags: string[]
}

export const CSBContext = React.createContext<Record<string, CSB>>({})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchCSB(ids: string[]) {
  const boxes: Record<string, CSB> = {}

  for (const id of ids) {
    try {
      // add a delay between requests to avoid being rate limited
      await wait(100)

      const { title, description, alias, screenshot_url, tags } = await fetch(
        `https://codesandbox.io/api/v1/sandboxes/${id}`
      ).then(async (res) => (await res.json()).data)

      boxes[id] = { title, description, alias, screenshot_url, tags }
    } catch (_) {
      console.warn(`fetchCSB: couldn't fetch ${id}`)
      boxes[id] = { title: '', description: '', alias: '', screenshot_url: '', tags: [] }
    }
  }

  return boxes
}

export function useCSB() {
  return React.useContext(CSBContext)
}
