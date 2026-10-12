import { createMdxBuildContext, getMdxBuildContext, type MdxBuildContext } from '../mdxContext'
import { importLocalMdxScope } from './localMdxRuntime'
import { createProcessor } from '@mdx-js/mdx'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import ts from 'typescript'
import { localMdxScopes } from './localMdxScopes'

type Node = {
  type: string
  name?: string
  value?: string
  children?: Node[]
  attributes?: { type: string; name?: string; value?: string | { value: string } | null }[]
  position?: { start: { offset: number }; end: { offset: number } }
}

/** Parse MDX rather than recognizing imports or JSX inside fenced examples. */
export function parseLocalMdx(source: string) {
  const tree = createProcessor().parse(source) as unknown as Node
  const imports = (tree.children ?? []).filter((node) => node.type === 'mdxjsEsm')
  const statements = imports.map((node) => node.value ?? '').join('\n')
  const file = ts.createSourceFile('imports.ts', statements, ts.ScriptTarget.Latest, true)
  const names: string[] = []
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      throw new Error(
        'Local MDX supports static imports; move declarations and exports to TypeScript modules.',
      )
    }
    const clause = statement.importClause
    if (!clause || clause.isTypeOnly) continue
    if (clause.name) names.push(clause.name.text)
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) names.push(clause.namedBindings.name.text)
      else
        names.push(
          ...clause.namedBindings.elements
            .filter((item) => !item.isTypeOnly)
            .map((item) => item.name.text),
        )
    }
  }
  return { tree, imports, statements, names }
}

function walk(node: Node, visit: (node: Node) => void) {
  visit(node)
  node.children?.forEach((child) => walk(child, visit))
}

function validateProps(
  source: string,
  absoluteFilePath: string,
  parsed: ReturnType<typeof parseLocalMdx>,
) {
  const checks: string[] = []
  walk(parsed.tree, (node) => {
    if (!node.name || !parsed.names.includes(node.name.split('.')[0]) || !node.position) return
    const jsx = source.slice(node.position.start.offset, node.position.end.offset)
    // Check the authored opening element, including expression and spread props. Markdown
    // children are handled by MDX, so represent them as a string for the JSX typecheck.
    const expression = ts.createSourceFile(
      'element.tsx',
      `const element = (${jsx})`,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    let openingEnd: number | undefined
    const findOpening = (child: ts.Node) => {
      if (openingEnd !== undefined) return
      if (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child))
        openingEnd = child.end - 'const element = ('.length
      else ts.forEachChild(child, findOpening)
    }
    findOpening(expression)
    const opening = jsx.slice(0, openingEnd)
    checks.push(opening.endsWith('/>') ? opening : `${opening}{''}</${node.name}>`)
  })
  const filename = join(dirname(absoluteFilePath), '__pmndrs_mdx_check__.tsx')
  const contents = `${parsed.statements}\nfunction Check() { return <>${checks.join('\n')}</> }`
  const config = ts.findConfigFile(dirname(absoluteFilePath), ts.sys.fileExists)
  const configOptions = config
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(config, ts.sys.readFile).config,
        ts.sys,
        dirname(config),
      ).options
    : {}
  const options: ts.CompilerOptions = {
    ...configOptions,
    noEmit: true,
    incremental: false,
    strict: true,
    skipLibCheck: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ESNext,
    allowImportingTsExtensions: true,
  }
  const host = ts.createCompilerHost(options)
  const original = host.getSourceFile.bind(host)
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
    path === filename
      ? ts.createSourceFile(path, contents, languageVersion, true, ts.ScriptKind.TSX)
      : original(path, languageVersion, onError, shouldCreateNewSourceFile)
  const engineRoot = dirname(createRequire(import.meta.url).resolve('@pmndrs/docs/package.json'))
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      let specifier = name
      if (name.startsWith('@/') && containingFile.startsWith(engineRoot)) {
        specifier = join(
          engineRoot,
          name.startsWith('@/registry/') ? name.slice(2) : `src/${name.slice(2)}`,
        )
      }
      return (
        ts.resolveModuleName(specifier, containingFile, options, host).resolvedModule ??
        ts.resolveModuleName(specifier, join(engineRoot, 'src/consumer.ts'), options, host)
          .resolvedModule
      )
    })
  const program = ts.createProgram([filename], options, host)
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
  if (diagnostics.length) {
    throw new Error(
      `${absoluteFilePath}: invalid local MDX props or imports\n${ts.formatDiagnosticsWithColorAndContext(
        diagnostics,
        {
          getCurrentDirectory: () => dirname(absoluteFilePath),
          getCanonicalFileName: (file) => file,
          getNewLine: () => '\n',
        },
      )}`,
    )
  }
}

/** Resolves trusted repository imports without changing any authored source. */
export async function resolveLocalMdx(
  source: string,
  absoluteFilePath: string,
  context: MdxBuildContext = getMdxBuildContext(),
) {
  context = createMdxBuildContext(context)
  if (!/^\s*(?:import|export)\s/m.test(source)) return { source, scope: {}, markdown: source }
  const parsed = parseLocalMdx(source)
  if (!parsed.imports.length) return { source, scope: {}, markdown: source }
  // Website preparation already checked the authored source before generating static scopes.
  if (!localMdxScopes[absoluteFilePath]) validateProps(source, absoluteFilePath, parsed)
  const scope =
    localMdxScopes[absoluteFilePath] ?? (await importLocalMdxScope(absoluteFilePath, parsed))
  const removals = parsed.imports.map((node) => ({
    start: node.position!.start.offset,
    end: node.position!.end.offset,
    value: '',
  }))
  const replacements = [...removals]
  const evaluate = (expression: string) =>
    Function(...Object.keys(scope), `return (${expression})`)(...Object.values(scope))
  async function convert(node: Node): Promise<void> {
    if (node.name && parsed.names.includes(node.name.split('.')[0])) {
      const component = node.name
        .split('.')
        .reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], scope)
      const converter = (
        component as {
          toMarkdown?: (
            props: Record<string, unknown>,
            context: MdxBuildContext,
          ) => string | Promise<string>
        }
      )?.toMarkdown
      if (typeof converter !== 'function')
        throw new Error(
          `${absoluteFilePath}: local component ${node.name} must declare toMarkdown with defineMdxComponent`,
        )
      const props: Record<string, unknown> = {}
      for (const attribute of node.attributes ?? []) {
        if (attribute.type === 'mdxJsxExpressionAttribute')
          Object.assign(
            props,
            evaluate((attribute as unknown as { value: string }).value.replace(/^\.\.\./, '')),
          )
        else if (attribute.name)
          props[attribute.name] =
            attribute.value === null
              ? true
              : typeof attribute.value === 'object'
                ? evaluate(attribute.value.value)
                : attribute.value
      }
      if (node.children?.length) {
        const firstChange = replacements.length
        for (const child of node.children) await convert(child)
        const childChanges = replacements.splice(firstChange)
        // Layout converters receive the resolved Markdown of their children.

        props.children = node.children
          .map((child) =>
            child.position
              ? childChanges
                  .filter(
                    (change) =>
                      change.start >= child.position!.start.offset &&
                      change.end <= child.position!.end.offset,
                  )
                  .sort((a, b) => b.start - a.start)
                  .reduce(
                    (text, change) =>
                      text.slice(0, change.start - child.position!.start.offset) +
                      change.value +
                      text.slice(change.end - child.position!.start.offset),
                    source.slice(child.position.start.offset, child.position.end.offset),
                  )
              : '',
          )
          .join('\n')
      }
      const value = await converter(props, context)
      if (typeof value !== 'string')
        throw new Error(`${absoluteFilePath}: ${node.name}.toMarkdown must return a string`)
      replacements.push({
        start: node.position!.start.offset,
        end: node.position!.end.offset,
        value,
      })
      return
    }
    if (
      (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') &&
      node.value &&
      parsed.names.some((name) => new RegExp(`\\b${name}\\b`).test(node.value!))
    ) {
      replacements.push({
        start: node.position!.start.offset,
        end: node.position!.end.offset,
        value: String(evaluate(node.value)),
      })
    }
    for (const child of node.children ?? []) await convert(child)
  }
  await convert(parsed.tree)
  const replace = (changes: typeof replacements) =>
    changes
      .sort((a, b) => b.start - a.start)
      .reduce(
        (text, change) => text.slice(0, change.start) + change.value + text.slice(change.end),
        source,
      )
  return { source: replace(removals), scope, markdown: replace(replacements) }
}
