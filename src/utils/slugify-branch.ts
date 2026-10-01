/**
 * Turning a git branch name into the URL of that branch's deployment.
 *
 * Hosts with per-branch URLs each derive the hostname from the branch name with their own rules,
 * so a URL template (`VERSION_URL_TEMPLATE`) names the rule it needs with a placeholder:
 *
 * - `{branch}` (or `{branch:generic}`): our own slug, for aliases we create ourselves
 * - `{branch:vercel}`: Vercel's generated branch URL, `https://<project>-git-{branch:vercel}-<scope>.vercel.app`
 * - `{branch:cloudflare}`: Cloudflare Pages' branch alias, `https://{branch:cloudflare}.<project>.pages.dev`
 * - `{branch:netlify}`: Netlify's branch deploy, `https://{branch:netlify}--<site>.netlify.app`
 * - `{branch:raw}`: the branch name as is, URL-encoded (for a path or a query string)
 */

export type BranchPreset = 'generic' | 'vercel' | 'cloudflare' | 'netlify' | 'raw'

const PRESETS: readonly BranchPreset[] = ['generic', 'vercel', 'cloudflare', 'netlify', 'raw']

/**
 * The generic slug: lowercase, every run of characters other than `[a-z0-9]` becomes one `-`,
 * and no `-` at either end — e.g. `feat/Sidebar_switcher` → `feat-sidebar-switcher`.
 *
 * It is valid in a DNS label and readable, which is all an alias we create ourselves needs
 * (e.g. `docs-git-<slug>-pmndrs.vercel.app`, set with `vercel alias set` in CI).
 */
export function slugifyBranch(branch: string): string {
  return branch
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Vercel's branch slug, before any length truncation: the first `/` becomes `-`, then the name
 * is lowercased and every character outside `[a-z0-9-]` is deleted (not replaced) — e.g.
 * `fix/tests/some-more` → `fix-testssome-more`, `v3_docs` → `v3docs`.
 *
 * Undocumented by Vercel: inferred from, and checked against, 135 real branch URLs.
 */
export function slugifyBranchVercel(branch: string): string {
  return branch
    .replace('/', '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

/** Longest DNS label allowed (RFC 1035). */
const MAX_LABEL_LENGTH = 63

/**
 * The part of a Vercel branch URL's label that `{branch:vercel}` stands for, given the literal
 * text around it in that label: `prefix` is `<project>-git-`, `suffix` is `-<scope>`.
 *
 * When `<project>-git-<slug>-<scope>` is over 63 characters, Vercel cuts `<project>-git-<slug>`
 * short enough to fit `-<hash6>-<scope>` after it, drops a trailing `-`, and appends that hash,
 * where `hash6 = sha256("git-" + branch + project)` in hex, first 6 characters. Without the hash,
 * a long branch's URL could not be predicted. Same caveat as {@link slugifyBranchVercel}.
 *
 * Branches from forks (`fork-<owner>-<slug>`) are not handled: their URL is not ours to link to.
 */
export async function vercelBranchLabelPart(
  branch: string,
  prefix: string,
  suffix: string,
): Promise<string> {
  const slug = slugifyBranchVercel(branch)
  if (prefix.length + slug.length + suffix.length <= MAX_LABEL_LENGTH) return slug

  if (!prefix.endsWith('-git-')) {
    throw new Error(
      `{branch:vercel} must follow "<project>-git-" in its hostname label (got "${prefix}"), ` +
        'e.g. https://<project>-git-{branch:vercel}-<scope>.vercel.app',
    )
  }
  const project = prefix.slice(0, -'-git-'.length)
  const hash6 = (await sha256Hex(`git-${branch}${project}`)).slice(0, 6)

  const hashAndSuffix = `-${hash6}${suffix}`
  const head = `${prefix}${slug}`
    .slice(0, MAX_LABEL_LENGTH - hashAndSuffix.length)
    .replace(/-+$/, '')
  return `${head.slice(prefix.length)}-${hash6}`
}

/** Longest Cloudflare Pages branch alias. */
const CLOUDFLARE_MAX_ALIAS_LENGTH = 28

/**
 * Cloudflare Pages' branch alias (`<alias>.<project>.pages.dev`): lowercase, non-alphanumeric
 * characters become `-` — e.g. `fix/api` → `fix-api`
 * (https://developers.cloudflare.com/pages/configuration/preview-deployments/).
 *
 * The docs stop there. The rest is observed, not documented: the alias is cut to 28 characters
 * and only then loses a trailing `-` (`download-api-add-filter-information` →
 * `download-api-add-filter-info`). Collapsing runs of `-` and trimming a leading one are
 * assumptions, which only matter for unusual branch names.
 */
export function slugifyBranchCloudflare(branch: string): string {
  return slugifyBranch(branch).slice(0, CLOUDFLARE_MAX_ALIAS_LENGTH).replace(/-+$/, '')
}

/**
 * Netlify's branch deploy subdomain (`<branch>--<site>.netlify.app`,
 * https://docs.netlify.com/deploy/deploy-overview/): characters that are not valid in a URL
 * become `-` — e.g. `feature/blog` → `feature-blog`, per Netlify staff on
 * https://answers.netlify.com/t/how-to-do-a-branch-deploy-when-it-is-a-branch-containing-slash/4240.
 *
 * Lowercasing and collapsing runs of `-` are assumptions (hostnames are case-insensitive anyway).
 * Netlify does not truncate: past 63 characters for `<branch>--<site>`, the URL does not work
 * (https://docs.netlify.com/manage/domains/manage-domains/manage-domains-for-branch-deploys/).
 */
export function slugifyBranchNetlify(branch: string): string {
  return slugifyBranch(branch)
}

/** `{branch}` or `{branch:<preset>}`; the preset is captured as is, to report a bad one. */
const PLACEHOLDER = /\{branch(?::([^}]*))?\}/g

function isPreset(value: string): value is BranchPreset {
  return (PRESETS as readonly string[]).includes(value)
}

function unknownPresetError(preset: string, template: string): Error {
  return new Error(
    `Unknown branch preset "${preset}" in URL template "${template}". ` +
      `Use {branch} or {branch:<preset>} with one of: ${PRESETS.join(', ')}.`,
  )
}

/**
 * Checks that every `{branch:<preset>}` in `template` names a known preset, without expanding
 * anything -- so that a typo fails the build that is given the template, rather than every
 * reader's click on the switcher.
 *
 * @throws on an unknown preset
 */
export function assertValidUrlTemplate(template: string): void {
  for (const match of template.matchAll(PLACEHOLDER)) {
    const preset = match[1] ?? 'generic'
    if (!isPreset(preset)) throw unknownPresetError(preset, template)
  }
}

/**
 * Replaces every `{branch}` and `{branch:<preset>}` placeholder in `template` with `branch`,
 * slugified by that preset — e.g. `https://docs-git-{branch}-pmndrs.vercel.app` and
 * `feat/switcher` → `https://docs-git-feat-switcher-pmndrs.vercel.app`.
 *
 * Async because the `vercel` preset hashes long branch names, with Web Crypto: this runs both in
 * the CLI (Node) and in the browser.
 *
 * @throws on an unknown preset, or a `{branch:vercel}` that needs its project name and cannot
 * find it in the template
 */
export async function expandUrlTemplate(template: string, branch: string): Promise<string> {
  let result = ''
  let lastIndex = 0

  for (const match of template.matchAll(PLACEHOLDER)) {
    const start = match.index
    const end = start + match[0].length
    const preset = match[1] ?? 'generic'

    result += template.slice(lastIndex, start)
    result += await expandPlaceholder(preset, branch, template, start, end)
    lastIndex = end
  }

  return result + template.slice(lastIndex)
}

async function expandPlaceholder(
  preset: string,
  branch: string,
  template: string,
  start: number,
  end: number,
): Promise<string> {
  if (!isPreset(preset)) throw unknownPresetError(preset, template)

  switch (preset) {
    case 'generic':
      return slugifyBranch(branch)
    case 'raw':
      return encodeURIComponent(branch)
    case 'cloudflare':
      return slugifyBranchCloudflare(branch)
    case 'netlify':
      return slugifyBranchNetlify(branch)
    case 'vercel': {
      // The hostname label around the placeholder: back to the previous `.` or `/`, forward to the
      // next `.` or `/` — e.g. `drei-git-` and `-pmndrs` in `https://drei-git-{branch:vercel}-pmndrs.vercel.app`
      const before = template.slice(0, start)
      const after = template.slice(end)
      const prefix = before.slice(Math.max(before.lastIndexOf('.'), before.lastIndexOf('/')) + 1)
      const suffix = after.split(/[./]/)[0]
      return vercelBranchLabelPart(branch, prefix, suffix)
    }
  }
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
