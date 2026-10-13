import { compileFragment } from '@/fragments/compile'
import type { ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'

/**
 * Renders test components to HTML after their asynchronous children finish.
 *
 * @param element - React content to render.
 */
export async function renderToHtml(element: ReactNode) {
  let failure: unknown
  const stream = await renderToReadableStream(element, {
    onError(error) {
      failure = error
    },
  })
  await stream.allReady
  const html = await new Response(stream).text()
  if (failure) throw failure
  return html
}

/**
 * Renders the fragment compiler's output for focused authoring tests.
 *
 * @param source - MDX source, including frontmatter.
 * @param options - Source location and consumer configuration.
 */
export async function renderFragment(
  source: string,
  options: Parameters<typeof compileFragment>[1],
) {
  return renderToHtml(await compileFragment(source, options))
}
