'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

export function Mermaid({ children, id }: { children: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const renderDiagram = async () => {
      if (!children || typeof children !== 'string') {
        setError('Invalid mermaid diagram content')
        return
      }

      try {
        // Initialize mermaid with default configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
        })

        // Generate a unique ID for this diagram
        const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, children.trim())
        setSvg(svg)
        setError('')
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [children, id])

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
        <strong>Mermaid Error:</strong> {error}
      </div>
    )
  }

  return (
    <div ref={ref} className="my-6 flex justify-center overflow-auto">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} className="mermaid-diagram" />
      ) : (
        <div className="text-on-surface-variant/50">Loading diagram...</div>
      )}
    </div>
  )
}
