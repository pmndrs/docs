import { validateDocsConfig } from '@/config'
import consumerConfig from 'pmndrs-docs-config'
import { cache } from 'react'
import { getDocs } from './docs'

const config = validateDocsConfig(consumerConfig)

/**
 * Reads the website's docs with the statically imported consumer components and data.
 * @param root - MDX folder
 * @param slug - Current page, or null for all pages
 * @param slugOnly - Return only slugs for static route generation
 */
export function getSiteDocs(root: string, slug: string[] | null, slugOnly = false) {
  return getDocs(root, slug, slugOnly, config)
}

/**
 * Reads a website page and its navigation with the same consumer configuration.
 * @param slug - URL path segments
 */
export const getData = cache(async (...slug: string[]) => {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')
  // Website search uses every document's table of contents, including other pages.
  const docs = await getSiteDocs(MDX, null)
  const url = `/${slug.join('/')}`.toLowerCase()
  const doc = docs.find((doc) => doc.url === url)
  if (!doc) throw new Error(`Doc not found: ${url}`)
  return { docs, doc }
})
