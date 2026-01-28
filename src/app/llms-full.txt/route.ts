import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
import matter from 'gray-matter'
import fs from 'node:fs'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import remarkstringify from 'remark-stringify'
import { visit } from 'unist-util-visit'

export const dynamic = 'force-static'

/**
 * Remark plugin to replace JSX/MDX components with textual placeholders
 */
function remarkStripJsx() {
  return (tree: any) => {
    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (typeof index === 'undefined' || !parent) return

      // Remove ESM imports/exports
      if (node.type === 'mdxjsEsm') {
        parent.children.splice(index, 1)
        return index
      }

      // Handle JSX components (e.g., <Grid>, <Intro>, <Keypoints>)
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        // Get the component name
        const componentName = node.name || 'Unknown'

        // Replace with a paragraph containing the placeholder text
        const placeholderNode = {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: `[Render of ${componentName} component]`,
            },
          ],
        }

        parent.children.splice(index, 1, placeholderNode)
        return index
      }
    })
  }
}

/**
 * Clean markdown by removing JSX/MDX components using remark
 */
async function cleanMarkdown(content: string): Promise<string> {
  try {
    const result = await remark()
      .use(remarkMdx) // Parse MDX
      .use(remarkStripJsx) // Strip JSX components
      .use(remarkstringify, {
        // Configure stringify options
        bullet: '-',
        emphasis: '_',
        fences: true,
        listItemIndent: 'one',
      })
      .process(content)

    // Clean up multiple empty lines
    const cleaned = String(result)
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return cleaned
  } catch (error) {
    console.error('Error processing markdown:', error)
    // Fallback to original content if processing fails
    return content
  }
}

export async function GET() {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  // Get all markdown files
  const files = await crawl(MDX, (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir))

  // Parse files to get metadata and content
  const docs = await Promise.all(
    files.map(async (file) => {
      const path = file.replace(`${MDX}/`, '')
      const slug = [...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]
      const url = `/${slug.join('/')}`

      const str = await fs.promises.readFile(file, { encoding: 'utf-8' })
      const compiled = matter(str)
      const frontmatter = compiled.data

      const title: string = frontmatter.title?.trim() ?? slug[slug.length - 1].replace(/\-/g, ' ')
      const description: string = frontmatter.description ?? ''
      const nav: number = frontmatter.nav ?? Infinity
      const content = await cleanMarkdown(compiled.content)

      return {
        url,
        title,
        description,
        nav,
        content,
      }
    }),
  )

  // Sort by nav order
  docs.sort((a, b) => a.nav - b.nav)

  // Generate llms-full.txt content
  const header = `# pmndrs/docs - Full Documentation

Documentation generator for pmndrs/* projects.

This is a static MDX documentation generator with a GitHub reusable workflow, primarily used for pmndrs/* projects.

================================================================================

`

  const fullContent =
    header +
    docs
      .map((doc) => {
        return `# ${doc.title}

URL: ${doc.url}
${doc.description ? `Description: ${doc.description}\n` : ''}
${doc.content}

================================================================================
`
      })
      .join('\n')

  return new Response(fullContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
