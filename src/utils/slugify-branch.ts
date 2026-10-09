/**
 * Turning a git branch name into the URL of that branch's deployment.
 *
 * Hosts with per-branch URLs each derive the hostname from the branch name with their own rules,
 * so a URL template (`VERSION_URL_TEMPLATE`) names the rule it needs with a placeholder:
 *
 * - `{branch}` (or `{branch:generic}`): our own slug, for aliases we create ourselves -- bounded
 *   to fit its hostname label, see {@link genericBranchLabelPart}
 * - `{branch:vercel}`: Vercel's generated branch URL, `https://<project>-git-{branch:vercel}-<scope>.vercel.app`
 * - `{branch:raw}`: the branch name as is, URL-encoded (for a path or a query string)
 */

export type BranchPreset = 'generic' | 'vercel' | 'raw'

const PRESETS: readonly BranchPreset[] = ['generic', 'vercel', 'raw']

/**
 * The generic slug: lowercase, every run of characters other than `[a-z0-9]` becomes one `-`,
 * and no `-` at either end — e.g. `feat/Sidebar_switcher` → `feat-sidebar-switcher`.
 *
 * It is valid in a DNS label and readable, which is all an alias we create ourselves needs
 * (e.g. `docs-git-<slug>-pmndrs.vercel.app`, set with `vercel alias set` in CI) -- as long as the
 * label fits in 63 characters: in a hostname, `{branch}` is {@link genericBranchLabelPart}.
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

/** Characters of the hash a too-long slug ends with. */
const HASH_LENGTH = 6

/**
 * The part of a hostname label that `{branch}` stands for, given the literal text around it in
 * that label: e.g. `prefix` is `docs-git-` and `suffix` is `-pmndrs` in
 * `https://docs-git-{branch}-pmndrs.vercel.app`.
 *
 * The {@link slugifyBranch} slug, as long as `<prefix><slug><suffix>` fits in 63 characters.
 * Over that, the slug is cut to `63 - prefix.length - suffix.length - 7` characters, any `-` the
 * cut leaves at its end is dropped, and `-<hash6>` is appended, where `hash6` is the first 6
 * characters of the hex SHA-256 of the branch name, as is. The label is then at most 63 characters,
 * and two long branches that share their beginning still get two labels.
 *
 * The same idea as {@link vercelBranchLabelPart}, with a simpler hash, so that a CI step can
 * reproduce it -- though `pmndrs-docs version-url` prints the whole URL, which is simpler still.
 *
 * @throws when `prefix` and `suffix` leave no room for even the hash
 */
export async function genericBranchLabelPart(
  branch: string,
  prefix: string,
  suffix: string,
): Promise<string> {
  const slug = slugifyBranch(branch)
  const room = MAX_LABEL_LENGTH - prefix.length - suffix.length
  if (slug.length <= room) return slug

  if (room < HASH_LENGTH) {
    throw new Error(
      `{branch} cannot fit in a 63-character hostname label: "${prefix}" and "${suffix}" ` +
        `around it leave ${Math.max(room, 0)} characters, and a long branch needs ${HASH_LENGTH}.`,
    )
  }
  const hash = (await sha256Hex(branch)).slice(0, HASH_LENGTH)
  const head = slug.slice(0, room - HASH_LENGTH - 1).replace(/-+$/, '')
  return head ? `${head}-${hash}` : hash
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

  // The hostname label around the placeholder: back to the previous `.` or `/`, forward to the
  // next `.` or `/` — e.g. `drei-git-` and `-pmndrs` in `https://drei-git-{branch:vercel}-pmndrs.vercel.app`
  const before = template.slice(0, start)
  const after = template.slice(end)
  const prefix = before.slice(Math.max(before.lastIndexOf('.'), before.lastIndexOf('/')) + 1)
  const suffix = after.split(/[./]/)[0]

  switch (preset) {
    case 'generic':
      // Only a hostname label is bounded: in a path or a query string, the slug stays whole
      return isInHostname(before)
        ? genericBranchLabelPart(branch, prefix, suffix)
        : slugifyBranch(branch)
    case 'raw':
      return encodeURIComponent(branch)
    case 'vercel':
      return vercelBranchLabelPart(branch, prefix, suffix)
  }
}

/** Whether a placeholder preceded by `before` is in the URL's hostname: `scheme://` and no `/?#` since. */
function isInHostname(before: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*$/i.test(before)
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
