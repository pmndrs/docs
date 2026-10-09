'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

type MermaidProps = {
  chart: string
}

/**
 * Work around a mermaid bug that breaks every `block` / `block-beta` diagram in a React app.
 *
 * Mermaid's block layout eagerly calls `JSON.stringify` on block objects in debug log
 * arguments. Those objects hold a d3 selection, whose `_parents` is `[document.documentElement]`.
 * React attaches enumerable `__reactFiber$…` / `__reactProps$…` properties to `<html>` (the
 * app router renders it), so the stringify walks into the fiber graph and throws "Converting
 * circular structure to JSON". A `toJSON` on `<html>` only makes it serialize like a plain
 * element (`{}`), as it does outside React.
 *
 * Remove once mermaid stops stringifying DOM references:
 * https://github.com/mermaid-js/mermaid/issues/5530
 * https://github.com/mermaid-js/mermaid/issues/7907
 */
function preventMermaidBlockStringifyCrash() {
  const html = document.documentElement
  if (Object.hasOwn(html, 'toJSON')) return
  Object.defineProperty(html, 'toJSON', { value: () => ({}), configurable: true })
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!ref.current) return

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        preventMermaidBlockStringifyCrash()

        // Initialize with theme-aware configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        })

        // Generate a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Clear previous content
        if (ref.current) {
          ref.current.innerHTML = ''
        }

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)

        if (ref.current) {
          ref.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error)
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color: red;">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`
        }
      }
    }

    renderDiagram()
  }, [chart, resolvedTheme])

  return <div ref={ref} className="my-8 flex justify-center" />
}
