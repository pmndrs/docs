import { validateDocsConfig } from '@/config'
import consumerConfig from 'pmndrs-docs-config'
import { renderDocMarkdown } from './renderMarkdown'

const config = validateDocsConfig(consumerConfig)

/**
 * Exports a page with the same statically imported configuration as the website.
 * @param doc - Source document
 * @param docs - Site directory
 * @param root - MDX directory
 */
export function getSiteMarkdown(
  doc: Parameters<typeof renderDocMarkdown>[0],
  docs: Parameters<typeof renderDocMarkdown>[1],
  root: string,
) {
  return renderDocMarkdown(doc, docs, root, config)
}
