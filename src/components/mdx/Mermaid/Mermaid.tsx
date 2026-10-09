'use client'

import { useMtb } from 'material-theme-builder/react'
import type { MermaidConfig } from 'mermaid'
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

/**
 * Mermaid's `base` theme, fed with the MD3 roles in effect: the containers for the shapes, surface
 * and outline for the background, lines and borders, `error` for error states. The rest Mermaid
 * derives from them.
 *
 * Read off the document's computed style rather than passed as `var()`: Mermaid computes colours
 * from them (with khroma), which needs actual values. The palette defines its roles as hexes.
 */
function themeVariables(darkMode: boolean) {
  const style = getComputedStyle(document.documentElement)
  const role = (name: string) => style.getPropertyValue(`--md-sys-color-${name}`).trim()

  return {
    darkMode,
    background: role('surface'),
    textColor: role('on-surface'),
    lineColor: role('outline'),
    primaryColor: role('primary-container'),
    primaryTextColor: role('on-primary-container'),
    primaryBorderColor: role('outline'),
    secondaryColor: role('secondary-container'),
    secondaryTextColor: role('on-secondary-container'),
    secondaryBorderColor: role('outline'),
    tertiaryColor: role('tertiary-container'),
    tertiaryTextColor: role('on-tertiary-container'),
    tertiaryBorderColor: role('outline'),
    // Notes otherwise stay Mermaid's own yellow
    noteBkgColor: role('tertiary-container'),
    noteTextColor: role('on-tertiary-container'),
    noteBorderColor: role('outline'),
    errorBkgColor: role('error'),
    errorTextColor: role('on-error'),
  } satisfies MermaidConfig['themeVariables']
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  // The palette in effect: a new one whenever the reader re-seeds it (see `PrimaryColorMtb`), in
  // the commit that writes its `<style>`
  const { mtbConfig } = useMtb()

  useEffect(() => {
    if (!ref.current) return
    // A newer render supersedes this one
    let isCancelled = false

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        if (isCancelled) return
        preventMermaidBlockStringifyCrash()

        // Read once the import has settled, not when the effect runs: `next-themes` sets the `dark`
        // class in its own effect, which runs after this one, its child's
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: themeVariables(resolvedTheme === 'dark'),
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

        if (ref.current && !isCancelled) {
          ref.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error)
        if (ref.current && !isCancelled) {
          ref.current.innerHTML = `<pre class="text-error">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`
        }
      }
    }

    renderDiagram()

    return () => {
      isCancelled = true
    }
    // `mtbConfig` is not read here: it changes with the palette, for the roles to be read again
    // from the computed style
  }, [chart, resolvedTheme, mtbConfig])

  return <div ref={ref} data-slot="mermaid" className="my-8 flex justify-center" />
}
