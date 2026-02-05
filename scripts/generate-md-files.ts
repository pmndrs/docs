#!/usr/bin/env tsx

/**
 * This script generates static .md files for all documentation pages
 * It runs after the Next.js build to create plain text MDX files with frontmatter
 */

import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'

const MARKDOWN_REGEX = /\.mdx?$/

async function crawl(
  dir: string,
  filter?: (dir: string) => boolean,
  files: string[] = [],
): Promise<string[]> {
  const stat = await fs.lstat(dir)
  if (stat.isDirectory()) {
    const filenames = await fs.readdir(dir)
    await Promise.all(filenames.map(async (filename) => crawl(`${dir}/${filename}`, filter, files)))
  } else if (!filter || filter(dir)) {
    files.push(dir)
  }
  return files
}

async function generateMdFiles() {
  const MDX = process.env.MDX
  if (!MDX) {
    console.error('MDX environment variable not set')
    process.exit(1)
  }

  const outputDir = process.env.DIST_DIR || 'out'
  console.log(`Generating .md files in ${outputDir}...`)

  try {
    // Find all markdown files
    const files = await crawl(
      MDX,
      (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir),
    )

    console.log(`Found ${files.length} markdown files`)

    // Process each file
    for (const file of files) {
      const relativePath = file.replace(`${MDX}/`, '')
      const slug = relativePath.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')
      const url = `/${slug.join('/')}`

      // Read and parse the file
      const str = await fs.readFile(file, { encoding: 'utf-8' })
      const parsed = matter(str)

      // Reconstruct the full MDX source with frontmatter
      const frontmatterString = matter.stringify(parsed.content, parsed.data)

      // Create output path
      const mdPath = `${url}.md`
      const fullPath = path.join(outputDir, mdPath)

      // Ensure directory exists
      const dir = path.dirname(fullPath)
      await fs.mkdir(dir, { recursive: true })

      // Write the .md file
      await fs.writeFile(fullPath, frontmatterString, 'utf-8')
      console.log(`Generated: ${mdPath}`)
    }

    console.log(`✓ Successfully generated ${files.length} .md files`)
  } catch (error) {
    console.error('Error generating .md files:', error)
    process.exit(1)
  }
}

generateMdFiles()
