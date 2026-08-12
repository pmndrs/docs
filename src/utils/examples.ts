/**
 * The examples gallery, as served by this MCP server.
 *
 * There is very little here on purpose. pmndrs/examples publishes the documents
 * an agent reads -- `/catalog/index.md` and `/catalog/<name>.md` -- already
 * rendered, because they are published for the open web too: every example page
 * points at its markdown with `rel="alternate"`, and a static host cannot render
 * on demand. So this server hands them on verbatim rather than building a second
 * rendering that would drift from the first.
 *
 * That leaves one job worth doing here: making sure a name from a model reaches
 * a URL only if it is the shape a published example has.
 */

/**
 * Where the gallery lives. Overridable so the MCP server can be developed
 * against a local `pnpm build` of pmndrs/examples -- the catalog only exists
 * once that repo has built.
 */
export const EXAMPLES_URL = process.env.EXAMPLES_URL || 'https://pmndrs.github.io/examples'

/** Every published example is a kebab-case directory name. Anything else is a typo. */
const EXAMPLE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * `index` is legal kebab-case and sits in the same directory, so it would serve
 * the index of the whole gallery under the guise of one example.
 */
const RESERVED_NAME = 'index'

export function catalogUrl(file: string, base = EXAMPLES_URL) {
  return `${base}/catalog/${file}.md`
}

export function assertExampleName(name: string) {
  if (!EXAMPLE_NAME.test(name) || name === RESERVED_NAME) {
    throw new Error(`Not an example name: ${name}`)
  }
  return name
}
