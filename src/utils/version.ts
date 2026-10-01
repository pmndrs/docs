import { DEFAULT_PRODUCTION_BRANCH } from '@/cli/version-env'

import { expandUrlTemplate } from './slugify-branch'

//
// The version of the docs being viewed, and the other branches' deployments to switch to. The
// CLI computes it from git at build time and passes it to the Next build as `NEXT_PUBLIC_VERSION_*`
// env vars, which Next inlines in the client bundle: each must be read as a static
// `process.env.NEXT_PUBLIC_X`, never destructured.
//

export type VersionInfo = {
  /** e.g. `v4.4.0` on a tagged commit, `v4.4.0-3-gd3103f4` after it. */
  label?: string
  /** The branch this deployment was built from. */
  branch?: string
  /**
   * The URL of a branch's deployment, with a `{branch}` placeholder. Opt-in: without it, the
   * version is a static label, with no switcher and no banner.
   */
  urlTemplate?: string
  /** The branch deployed to `productionUrl`. */
  productionBranch: string
  /**
   * The public URL of the production deployment, base path included:
   * `NEXT_PUBLIC_VERSION_PRODUCTION_URL`, or this build's own `NEXT_PUBLIC_URL` when that is unset.
   */
  productionUrl?: string
  /**
   * The branches to switch to, as the build lists them: the production branch first, the current
   * one included, no duplicates.
   */
  branches: string[]
}

export const versionInfo: VersionInfo = {
  label: process.env.NEXT_PUBLIC_VERSION_LABEL || undefined,
  branch: process.env.NEXT_PUBLIC_VERSION_BRANCH || undefined,
  urlTemplate: process.env.NEXT_PUBLIC_VERSION_URL_TEMPLATE || undefined,
  productionBranch: process.env.NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH || DEFAULT_PRODUCTION_BRANCH,
  productionUrl:
    process.env.NEXT_PUBLIC_VERSION_PRODUCTION_URL || process.env.NEXT_PUBLIC_URL || undefined,
  branches: parseBranches(process.env.NEXT_PUBLIC_VERSION_BRANCHES),
}

/**
 * The branches from their JSON array, e.g. `["main","feat/switcher"]`. Anything else (unset,
 * malformed, not an array of strings) gives an empty list rather than breaking the page.
 */
export function parseBranches(json: string | undefined): string[] {
  if (!json) return []

  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(value)) return []

  return value.filter((item): item is string => typeof item === 'string' && item !== '')
}

/** `url` without its trailing slashes, so a path can be appended to it. */
export function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/**
 * The base URL of `branch`'s deployment, with no trailing slash: the production URL for the
 * production branch (when known), the URL template expanded for any other.
 */
export async function deploymentUrl(
  branch: string,
  {
    urlTemplate,
    productionBranch,
    productionUrl,
  }: Pick<VersionInfo, 'urlTemplate' | 'productionBranch' | 'productionUrl'>,
): Promise<string | undefined> {
  let url: string | undefined
  if (branch === productionBranch && productionUrl) {
    url = productionUrl
  } else if (urlTemplate) {
    url = await expandUrlTemplate(urlTemplate, branch)
  }

  return url === undefined ? undefined : withoutTrailingSlash(url)
}
