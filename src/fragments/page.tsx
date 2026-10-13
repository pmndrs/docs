import { compileFragment } from '@/fragments/compile'
import { fragmentConfig } from '@/fragments/config'
import { readFile } from 'node:fs/promises'

/**
 * Renders a single file or stdin input through Next's server renderer.
 */
export default async function FragmentPage() {
  const input = process.env.PMNDRS_FRAGMENT_INPUT
  if (!input) return null

  const source = await readFile(input, 'utf8')
  const content = await compileFragment(source, {
    absoluteFilePath: process.env.PMNDRS_FRAGMENT_PATH ?? input,
    baseUrl: process.env.MDX_BASEURL,
    config: fragmentConfig,
  })
  return <div data-pmndrs-fragment>{content}</div>
}
