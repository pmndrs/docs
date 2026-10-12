import { getSourceVersion, getVersion } from './git-info'
import { createMdxBuildContext, type MdxBuildContext } from '../mdxContext'

/** Resolve once in the consumer checkout; explicit data also supports consumers without git. */
export function resolveMdxBuildContext({
  cwd,
  env = process.env,
  context,
}: {
  cwd?: string
  env?: Record<string, string | undefined>
  context?: MdxBuildContext
} = {}): MdxBuildContext {
  if (context) return createMdxBuildContext(context)
  if (env.MDX_BUILD_CONTEXT !== undefined)
    return createMdxBuildContext(JSON.parse(env.MDX_BUILD_CONTEXT))
  return createMdxBuildContext({
    label: env.LIB_VERSION || getVersion({ cwd, tagMatch: env.TAG_MATCH, env }) || '',
    ...getSourceVersion({ cwd, env }),
  })
}
