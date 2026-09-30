/**
 * Adds a `depth` to each heading: its nesting relative to the headings actually present, not its
 * raw heading level.
 *
 * A heading's parent is the closest previous heading with a lower level. A heading without a
 * parent has depth 1, any other one its parent's depth + 1. So an h4 directly under an h2 gets
 * depth 2 (not 3), and an h3 that comes before any h2 gets depth 1.
 */
export function withDepth<T extends { level: number }>(headings: T[]): (T & { depth: number })[] {
  const result: (T & { depth: number })[] = []

  for (const heading of headings) {
    const parent = result.findLast((previous) => previous.level < heading.level)
    const depth = parent ? parent.depth + 1 : 1

    result.push({ ...heading, depth })
  }

  return result
}
