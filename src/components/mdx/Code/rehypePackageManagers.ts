import { toPackageManagers } from '@/utils/packageManagers'
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

// Not `zsh`: Prism does not know it, so a ```zsh block fails to compile anyway
const shellLanguages = ['language-bash', 'language-sh', 'language-shell']

function isShellCode(node: Element) {
  const className = node.properties?.className
  return Array.isArray(className) && className.some((name) => shellLanguages.includes(`${name}`))
}

/**
 * Gives a shell code block of npm commands (```bash, ```sh or ```shell) the same
 * commands in every package manager, as `pnpm`, `npm`, `yarn` and `bun` properties on its
 * `<pre>`: the `Code` component then offers them as tabs.
 *
 * Runs before `rehype-prism-plus`, on the raw text of the block.
 */
export function rehypePackageManagers() {
  return () => (tree: Root) => {
    visit(tree, 'element', (node) => {
      // Look for <pre><code class="language-bash">...</code></pre>
      if (node.tagName !== 'pre' || node.children.length !== 1) return

      const codeNode = node.children[0]
      if (codeNode.type !== 'element' || codeNode.tagName !== 'code' || !isShellCode(codeNode)) {
        return
      }

      const textNode = codeNode.children[0]
      if (codeNode.children.length !== 1 || textNode.type !== 'text') return

      const commands = toPackageManagers(textNode.value)
      if (!commands) return

      node.properties = { ...node.properties, ...commands }
    })
  }
}
