#!/usr/bin/env node

/**
 * Copy OG images to out/ directory after Next.js build
 * This ensures images are available even if Next.js build has issues
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDir = path.join(__dirname, '..', 'public', 'og')
const outBaseDir = path.join(__dirname, '..', 'out')
const targetDir = path.join(outBaseDir, 'og')

try {
  // Check if source OG images exist
  if (!fs.existsSync(sourceDir)) {
    console.log('⚠ No OG images found in public/og/ - skipping copy')
    process.exit(0)
  }

  // Create out/ directory if it doesn't exist (in case build failed before creating it)
  if (!fs.existsSync(outBaseDir)) {
    console.log('📁 Creating out/ directory')
    fs.mkdirSync(outBaseDir, { recursive: true })
  }

  // Copy OG images to out directory
  fs.cpSync(sourceDir, targetDir, { recursive: true })

  // Count files copied
  const allEntries = fs.readdirSync(targetDir, { recursive: true })
  const files = allEntries.filter((f) => typeof f === 'string' && f.endsWith('.png'))
  console.log(`✓ Copied ${files.length} OG images to out/og/ directory`)
} catch (error) {
  const errorMessage = error?.message || String(error)
  console.error('Error copying OG images:', errorMessage)
  // Don't fail the build
  process.exit(0)
}
