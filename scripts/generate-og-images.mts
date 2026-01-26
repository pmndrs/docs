#!/usr/bin/env node

/**
 * Generate static Open Graph images at build time
 * Compatible with Next.js static export
 */

import { ImageResponse } from '@vercel/og'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MDX = process.env.MDX || 'docs'
const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME || 'Documentation'
const THEME_PRIMARY = process.env.THEME_PRIMARY || '#323e48'
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || ''

const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Recursively find all MDX files
 */
async function crawl(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      await crawl(fullPath, files)
    } else if (entry.isFile() && MARKDOWN_REGEX.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Extract metadata from MDX file
 */
function getDocMetadata(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter } = matter(content)

  const relativePath = filePath.replace(`${rootDir}/`, '')
  const slug = relativePath.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')

  const title = frontmatter.title || slug[slug.length - 1].replace(/-/g, ' ')
  const description = frontmatter.description || ''

  return { slug, title, description }
}

async function generateOGImage(title, description) {
  const imageResponse = new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#1a1a1a',
          padding: 80,
        },
        children: [
          // Site name with accent bar
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: 8,
                      height: 48,
                      backgroundColor: THEME_PRIMARY,
                      borderRadius: 4,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 36,
                      fontWeight: 600,
                      color: '#ffffff',
                      opacity: 0.9,
                    },
                    children: NEXT_PUBLIC_LIBNAME,
                  },
                },
              ],
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                maxWidth: '100%',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 72,
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    },
                    children: title,
                  },
                },
                description
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 32,
                          color: '#a0a0a0',
                          lineHeight: 1.4,
                        },
                        children: description,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                fontSize: 24,
                color: '#606060',
              },
              children: NEXT_PUBLIC_URL.replace(/^https?:\/\//, '') || 'docs',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    },
  )

  const arrayBuffer = await imageResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function main() {
  console.log('🖼️  Generating Open Graph images...')

  try {
    const rootDir = path.join(__dirname, '..', MDX)
    const files = await crawl(rootDir)

    if (files.length === 0) {
      console.log('  No MDX files found')
      return
    }

    const ogDir = path.join(__dirname, '..', 'public', 'og')

    // Create og directory
    if (!fs.existsSync(ogDir)) {
      fs.mkdirSync(ogDir, { recursive: true })
    }

    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      try {
        const { slug, title, description } = getDocMetadata(file, rootDir)
        const pngBuffer = await generateOGImage(title, description)

        const slugPath = slug.join('/')
        const filePath = path.join(ogDir, `${slugPath}.png`)
        const fileDir = path.dirname(filePath)

        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true })
        }

        fs.writeFileSync(filePath, pngBuffer)
        console.log(`  ✓ ${slugPath}`)
        successCount++
      } catch (error) {
        console.error(`  ✗ ${file}: ${error.message}`)
        errorCount++
      }
    }

    console.log(
      `\n✨ Generated ${successCount} OG images${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
    )
  } catch (error) {
    console.error('Error generating OG images:', error)
    // Don't fail the build
    process.exit(0)
  }
}

main()
