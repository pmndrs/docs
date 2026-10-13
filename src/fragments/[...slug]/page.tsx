import { fragmentConfig } from '@/fragments/config'
import { getDocs, parseDocsMetadata } from '@/utils/docs'

type FragmentDocumentProps = {
  /** Document path assigned by Next during static generation. */
  params: Promise<{ slug: string[] }>
}

// These routes run only in an isolated CLI export, with one root and configuration
// for the worker's lifetime. Share the promise so concurrent pages also reuse the
// full collection, including rich Entries and CodeSandbox metadata.
let documents: ReturnType<typeof getDocs> | undefined

/**
 * Renders each document through the website's MDX pipeline with static components.
 */
export default async function FragmentDocumentPage({ params }: FragmentDocumentProps) {
  const root = process.env.MDX
  if (!root) throw new Error('MDX env var not set')

  const { slug } = await params
  const docs = await (documents ??= getDocs(root, null, false, fragmentConfig))
  const url = `/${slug.join('/')}`.toLowerCase()
  const doc = docs.find((entry) => entry.url === url)
  if (!doc) throw new Error(`Doc not found: ${url}`)

  return <div data-pmndrs-fragment>{doc.content}</div>
}

/**
 * Enumerates folder documents for Next's static export.
 */
export async function generateStaticParams() {
  const root = process.env.MDX
  if (!root || process.env.PMNDRS_FRAGMENT_INPUT) return []
  const docs = await parseDocsMetadata(root)
  return docs.map(({ slug }) => ({ slug }))
}
