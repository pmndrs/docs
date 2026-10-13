import type { Element, Root } from 'hast'
import { defaultHandlers } from 'hast-util-to-mdast'
import { autolink } from 'micromark-core-commonmark'
import type { Options } from 'rehype-remark'
import type {} from 'remark-parse'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/** Restores CommonMark autolinks without interpreting literal code or replacing source text. */
export const remarkAutolinks: Plugin = function () {
  const data = this.data()
  const construct = { ...autolink, name: 'markdownExportAutolink' }
  const extensions = (data.micromarkExtensions ??= [])
  for (const [index, extension] of extensions.entries()) {
    const flow = extension.flow?.[60]
    if (!flow) continue
    const constructs = Array.isArray(flow) ? flow : [flow]
    extensions[index] = {
      ...extension,
      flow: {
        ...extension.flow,
        60: constructs.map((candidate) => {
          if (candidate.name !== 'mdxJsxFlowTag') return candidate
          const replacement: typeof candidate = {
            ...candidate,
            // Let a leading autolink enter paragraph parsing instead of failing as an MDX tag.
            tokenize(effects, ok, nok) {
              return effects.check(construct, nok, candidate.tokenize.call(this, effects, ok, nok))
            },
          }
          return replacement
        }),
      },
    }
  }
  extensions.push({ text: { 60: construct } })
}

/** Carries fenced code metadata across React's HTML rendering without touching code text. */
export function rehypePreserveCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'code' && typeof node.data?.meta === 'string') {
        node.properties['data-markdown-meta'] = node.data.meta
      }
    })
  }
}

function footnoteId(value: string) {
  const prefix = 'user-content-fn-'
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

/** Restores semantic Markdown constructs from the standard MDX HTML representation. */
export const markdownHandlers: NonNullable<Options['handlers']> = {
  pre(state, node) {
    const result = defaultHandlers.pre(state, node)
    const code = node.children.find(
      (child): child is Element => child.type === 'element' && child.tagName === 'code',
    )
    const meta = code?.properties.dataMarkdownMeta
    if (result && !Array.isArray(result) && result.type === 'code' && typeof meta === 'string') {
      result.meta = meta
    }
    return result
  },
  sup(state, node) {
    const reference = node.children.find(
      (child): child is Element =>
        child.type === 'element' &&
        child.tagName === 'a' &&
        child.properties.dataFootnoteRef !== undefined,
    )
    const href = reference?.properties.href
    if (typeof href === 'string' && href.startsWith('#')) {
      return { type: 'footnoteReference', identifier: footnoteId(href.slice(1)) }
    }
    return defaultHandlers.sup(state, node)
  },
  a(state, node) {
    if (node.properties.dataFootnoteBackref !== undefined) return
    return defaultHandlers.a(state, node)
  },
  section(state, node) {
    if (node.properties.dataFootnotes === undefined) {
      return defaultHandlers.section(state, node)
    }
    const list = node.children.find(
      (child): child is Element => child.type === 'element' && child.tagName === 'ol',
    )
    if (!list) return
    return list.children.flatMap((child) => {
      if (child.type !== 'element' || typeof child.properties.id !== 'string') return []
      return [
        {
          type: 'footnoteDefinition' as const,
          identifier: footnoteId(child.properties.id),
          children: state.toFlow(state.all(child)),
        },
      ]
    })
  },
}
