//
// Why: since 0.186.0, three's CommonJS entry (build/three.cjs) is a shim that calls
// `process.emitWarning` before re-exporting the ES module. Sandpack's in-browser bundler loads
// that CommonJS entry, and its `process` polyfill has no `emitWarning`, so every preview fails
// with "process.emitWarning is not a function".
//
// Remove this once three drops the shim, or Sandpack's polyfill gains `emitWarning`.
//

/** The last three release whose CommonJS entry runs in Sandpack. */
export const LAST_SANDPACK_SAFE_THREE = '0.185.1'

const FIRST_BROKEN_MINOR = 186

/**
 * Whether a `three` version spec would resolve to a release with the broken CommonJS entry.
 *
 * Handles the specs docs actually use: `latest`, `*`, open ranges like `>=0.150`, and exact,
 * caret or tilde versions. three is still 0.x, so `^0.185.0` and `~0.185.0` both stay on 0.185.
 */
export function resolvesToBrokenThree(spec: string) {
  const version = spec.trim()

  if (version === '' || version === '*' || version === 'x' || version === 'latest') return true

  // ">=0.150.0" or ">0.150" has no upper bound: the latest release satisfies it
  if (version.startsWith('>')) return true

  // "0.186.1", "=0.186.1", "^0.186.0", "~0.186.0", "0.186.x"
  const match = version.match(/^[=^~v]*(\d+)\.(\d+)/)
  if (match) {
    const major = Number(match[1])
    const minor = Number(match[2])
    return major > 0 || minor >= FIRST_BROKEN_MINOR
  }

  // dist-tags other than latest, git urls, local paths...: leave them alone
  return false
}

/**
 * Replaces a `three` dependency that would resolve to a broken release with the last safe one.
 */
export function pinThreeForSandpack<T extends Record<string, string> | undefined>(
  dependencies: T,
): T {
  const three = dependencies?.three
  if (three === undefined || !resolvesToBrokenThree(three)) return dependencies

  return { ...dependencies, three: LAST_SANDPACK_SAFE_THREE }
}
