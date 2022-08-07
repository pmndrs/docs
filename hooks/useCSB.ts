import * as React from 'react'

export interface CSB {
  title: string
  description: string
  alias: string
  screenshot_url: string
  tags: string[]
  modules: { directory_shortid: string; title: string; code: string }[]
  directories: { shortid: string; title: string }[]
}

export const CSBContext = React.createContext<Record<string, CSB>>({})

export async function fetchCSB(ids: string[]) {
  const boxes: Record<string, CSB> = {}

  for (const id of ids) {
    boxes[id] = await fetch(`https://codesandbox.io/api/v1/sandboxes/${id}`).then(
      async (res) => (await res.json()).data
    )
  }

  return boxes
}

export function useCSB(id: string) {
  return React.useContext(CSBContext)[id]
}
