'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

type MermaidProps = {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!ref.current) return

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default

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
