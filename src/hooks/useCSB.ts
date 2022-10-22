import * as React from 'react'

export interface CSB {
  id: string
  title: string
  description: string
  alias: string
  screenshot_url: string
  tags: string[]
}

export const CSBContext = React.createContext<CSB[]>(null!)

export async function fetchCSB(ids: string[]) {
  const boxes: CSB[] = []

  let rateLimited = 0

  for (const id of ids) {
    try {
      const { title, description, alias, screenshot_url, tags } = await fetch(
        `https://codesandbox.io/api/v1/sandboxes/${id}`
      ).then(async (res) => (await res.json()).data)

      boxes.push({ id, title, description, alias, screenshot_url, tags })
    } catch (_) {
      rateLimited++
      boxes.push({ id, title: '', description: '', alias: '', screenshot_url: '', tags: [] })
    }
  }

  if (rateLimited) console.warn(`fetchCSB: rate-limited for ${rateLimited} boxes`)

  return boxes
}

export function useCSB() {
  return React.useContext(CSBContext)
}
