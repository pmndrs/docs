import type { ComponentType } from 'react'
import { z } from 'zod'

const reservedScopeNames = new Set([
  '__proto__',
  'opts',
  'frontmatter',
  '_Fragment',
  '_jsxDEV',
  '_jsx',
  '_jsxs',
  '_components',
  '_createMdxContent',
  '_missingMdxReference',
  'props',
  'MDXContent',
  'arguments',
  'eval',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

const scopeName = z
  .string()
  .regex(
    /^[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*$/u,
    'Use a JavaScript identifier for each scope key',
  )
  .refine((name) => !reservedScopeNames.has(name), 'This scope key is reserved')

const component = z.custom<ComponentType<any>>(
  (value) =>
    typeof value === 'function' ||
    (typeof value === 'object' &&
      value !== null &&
      '$$typeof' in value &&
      [
        Symbol.for('react.memo'),
        Symbol.for('react.forward_ref'),
        Symbol.for('react.lazy'),
      ].includes(value.$$typeof as symbol)),
  'Expected a React component',
)

const docsConfigSchema = z.object({
  components: z
    .record(z.string(), component)
    .optional()
    .describe('React components added to, or overriding, the built-in MDX components.'),
  markdownComponents: z
    .record(z.string(), component)
    .optional()
    .describe('Server-renderable alternatives used only in Markdown exports.'),
  scope: z
    .preprocess(
      (value, context) => {
        // Zod omits this key when parsing records, but MDX cannot receive it as a variable.
        if (value !== null && typeof value === 'object' && Object.hasOwn(value, '__proto__')) {
          context.addIssue({
            code: 'custom',
            path: ['__proto__'],
            message: 'This scope key is reserved',
          })
          return z.NEVER
        }
        return value
      },
      z.record(scopeName, z.unknown()),
    )
    .optional()
    .describe('Named values available in MDX expressions, such as JSON imported by the config.'),
})

/**
 * Consumer extensions available to ordinary MDX pages.
 */
export type DocsConfig = z.infer<typeof docsConfigSchema>

/**
 * Validates a consumer configuration before compiling any MDX pages.
 *
 * @param value - The default export of the consumer's configuration module
 */
export function validateDocsConfig(value: unknown): DocsConfig {
  return docsConfigSchema.parse(value)
}

const config = {} satisfies DocsConfig

/**
 * The website's default configuration when the consumer provides no extensions.
 */
export default config
