/// <reference types="node" />
/** Source provenance is separate from the human display label. Unknown values stay empty. */
export type MdxBuildContext = Readonly<{
  label: string
  branch: string
  ref: string
  refType: 'branch' | 'tag' | 'commit' | 'unknown'
  commit: string
}>

/** Copy and freeze caller data, rejecting malformed configuration before publication. */
export function createMdxBuildContext(context: MdxBuildContext): MdxBuildContext {
  const { label, branch, ref, refType, commit } = context
  if (
    [label, branch, ref, commit].some((value) => typeof value !== 'string') ||
    !['branch', 'tag', 'commit', 'unknown'].includes(refType) ||
    (refType !== 'unknown' && !ref) ||
    (refType === 'branch' && branch !== ref) ||
    (refType !== 'branch' && branch !== '')
  )
    throw new Error('Invalid MDX build context: provide label, branch, ref, refType and commit')
  return Object.freeze({ label, branch, ref, refType, commit })
}

/** Server-side context resolved by the CLI before staging the consuming repository. */
export function getMdxBuildContext(): MdxBuildContext {
  const serialized = process.env.MDX_BUILD_CONTEXT
  if (serialized !== undefined) return createMdxBuildContext(JSON.parse(serialized))
  return createMdxBuildContext({
    label: process.env.NEXT_PUBLIC_VERSION_LABEL ?? '',
    branch: '',
    ref: '',
    refType: 'unknown',
    commit: '',
  })
}
