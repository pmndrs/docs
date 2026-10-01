// What git knows about the library being documented: its version, its branch, its siblings.
//
// The CLI asks at build time, in the caller's cwd -- the library's checkout, not this package's
// directory. Git is a nicety here, never a requirement: no git, not a repo, no remote, no tags,
// a shallow clone... each of these must still build a site. So every call degrades silently to
// `undefined` or `[]`, and the caller simply shows less.

import { execFileSync } from 'node:child_process'

/** The environment variables read here; a plain record, so tests can pass `{}`. */
type Env = Record<string, string | undefined>

/** Branches nobody browses docs for: bots open them, and they come and go by the dozen. */
export const DEFAULT_EXCLUDED_BRANCH_PREFIXES = ['dependabot/', 'renovate/', 'changeset-release/']

/**
 * Runs `git <args>` and returns its trimmed stdout, or `undefined` on any failure.
 *
 * `execFileSync` without a shell, so no argument (a tag pattern, say) is ever interpreted.
 * Stderr is swallowed: a failure is an expected outcome here, not something to print.
 * `GIT_TERMINAL_PROMPT=0` and the timeout keep a remote that asks for credentials from hanging
 * the build -- it fails instead, and that failure is fine.
 */
function git(args: string[], cwd?: string): string | undefined {
  try {
    const stdout = execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      timeout: 15_000,
    })
    const trimmed = stdout.trim()
    return trimmed || undefined
  } catch {
    return undefined
  }
}

/**
 * The branch being built.
 *
 * CI variables come first, because git alone lies there: a pull request is checked out as a
 * detached `HEAD`, and a host that builds itself may not ship `.git` at all. A detached `HEAD`
 * is no branch at all. In order:
 *
 * - GitHub Actions: `GITHUB_HEAD_REF` is the PR's source branch (set only on pull_request
 *   events), `GITHUB_REF_NAME` the pushed branch otherwise
 *   (https://docs.github.com/en/actions/reference/workflows-and-actions/variables#default-environment-variables)
 * - Vercel: `VERCEL_GIT_COMMIT_REF`, "the git branch of the commit the deployment was triggered by"
 *   (https://vercel.com/docs/environment-variables/system-environment-variables#vercel_git_commit_ref)
 */
export function getCurrentBranch({ cwd, env = process.env }: { cwd?: string; env?: Env } = {}):
  | string
  | undefined {
  const fromEnv = env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || env.VERCEL_GIT_COMMIT_REF
  if (fromEnv) return fromEnv

  const fromGit = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd)
  if (!fromGit || fromGit === 'HEAD') return undefined
  return fromGit
}

/**
 * A human label for the commit being built: `v10.7.9` on a tagged commit, `v10.7.9-3-ga1b2c3d`
 * three commits after it.
 *
 * `tagMatch` narrows the tags considered, which monorepos need (`leva@*` among the tags of
 * every other package). Without tags -- none yet, or a shallow clone that did not fetch them --
 * the label falls back to `<branch>@<shortsha>`, which still tells two deployments apart.
 * `package.json` is deliberately not read: in most consumers the root one is a private
 * placeholder whose version means nothing.
 */
export function getVersion({
  cwd,
  tagMatch,
  env = process.env,
}: { cwd?: string; tagMatch?: string; env?: Env } = {}): string | undefined {
  const describeArgs = ['describe', '--tags']
  if (tagMatch) describeArgs.push('--match', tagMatch)
  const described = git(describeArgs, cwd)
  if (described) return described

  const sha = git(['rev-parse', '--short', 'HEAD'], cwd)
  if (!sha) return undefined

  const branch = getCurrentBranch({ cwd, env })
  return branch ? `${branch}@${sha}` : sha
}

/**
 * Branch names out of `git ls-remote --heads` output, one `<sha>\trefs/heads/<name>` per line.
 *
 * Names keep their slashes (`fix/tests/some-more`): only the `refs/heads/` prefix is dropped.
 */
export function parseLsRemote(output: string): string[] {
  const prefix = 'refs/heads/'
  const branches: string[] = []
  for (const line of output.split('\n')) {
    const ref = line.split('\t')[1]?.trim()
    if (ref?.startsWith(prefix)) branches.push(ref.slice(prefix.length))
  }
  return branches
}

/**
 * An explicit branch list, as written in `VERSION_BRANCHES_LIST`: commas, spaces or newlines
 * between names, whichever reads best in a workflow file.
 */
export function parseBranchList(list: string): string[] {
  return list.split(/[\s,]+/).filter((name) => name !== '')
}

/**
 * Keeps the branches worth offering, in their given order (the caller sorts).
 *
 * With no `include` regex, the bot branches are left out. With one, it alone decides -- a
 * library that wants its renovate branches back can say so -- and it is matched anywhere in
 * the name, like `RegExp.test`, so anchor it (`^v\d+$`) to match whole names.
 */
export function filterBranches(branches: string[], include?: string): string[] {
  if (include) {
    const pattern = new RegExp(include)
    return branches.filter((name) => pattern.test(name))
  }
  return branches.filter(
    (name) => !DEFAULT_EXCLUDED_BRANCH_PREFIXES.some((prefix) => name.startsWith(prefix)),
  )
}

/**
 * The branches the version switcher offers, unsorted and possibly repeated: the caller orders
 * them.
 *
 * An explicit `list` wins over git and is taken as written: whoever wrote it already chose.
 * Otherwise the remote's heads are read once, at build time -- an old deployment keeps the list
 * of its day, which is an accepted staleness. `origin` and not local branches, because a CI
 * checkout only has the one it built.
 */
export function getBranches({
  cwd,
  include,
  list,
}: { cwd?: string; include?: string; list?: string } = {}): string[] {
  if (list) return parseBranchList(list)

  const output = git(['ls-remote', '--heads', 'origin'], cwd)
  if (!output) return []

  return filterBranches(parseLsRemote(output), include)
}
