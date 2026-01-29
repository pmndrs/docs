// https://sandpack.codesandbox.io/docs/guides/ssr#nextjs-app-dir

'use client'

import { useServerInsertedHTML } from 'next/navigation'

/**
 * Ensures CSSinJS styles are loaded server side.
 */
export const SandpackCSS = () => {
  useServerInsertedHTML(() => {
    try {
      // Try to load Sandpack CSS if available
      const { getSandpackCssText } = require('@codesandbox/sandpack-react')
      return <style dangerouslySetInnerHTML={{ __html: getSandpackCssText() }} id="sandpack" />
    } catch {
      // Sandpack not installed, skip CSS injection
      return null
    }
  })
  return null
}
