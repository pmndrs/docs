/**
 * The examples gallery, as served by this MCP server.
 *
 * There is very little here on purpose. pmndrs/examples publishes the documents
 * an agent reads, already rendered, because they are published for the open web
 * too: every example page points at its markdown with `rel="alternate"`, and a
 * static host cannot render on demand. So this server hands them on verbatim
 * rather than building a second rendering that would drift from the first.
 *
 * That leaves one job worth doing here: making sure a name from a model reaches
 * a URL only if it is the shape a published example has.
 */

/**
 * Where the gallery lives. Overridable so the MCP server can be developed
 * against a local `pnpm build` of pmndrs/examples -- the documents only exist
 * once that repo has built.
 */
export const EXAMPLES_URL = process.env.EXAMPLES_URL || 'https://pmndrs.github.io/examples'

/** Every published example is a kebab-case directory name. Anything else is a typo. */
const EXAMPLE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * An example's document is its page URL with `.md` on the end, so it can be
 * guessed rather than discovered -- `/examples/caustics` and
 * `/examples/caustics.md` are the same example, for two kinds of reader.
 */
export function exampleUrl(name: string, base = EXAMPLES_URL) {
  return `${base}/examples/${name}.md`
}

/**
 * The gallery index. Not `/examples.md`, because appending an extension only
 * works for a page that has a filename: a reader who tries it on the gallery
 * root asks for `/.md`. `llms.txt` is the root convention for this, and every
 * site built with this generator already publishes one.
 */
export function indexUrl(base = EXAMPLES_URL) {
  return `${base}/llms.txt`
}

export function assertExampleName(name: string) {
  if (!EXAMPLE_NAME.test(name)) throw new Error(`Not an example name: ${name}`)
  return name
}
