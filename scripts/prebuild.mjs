#!/usr/bin/env node
import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Check if we're building for static export
const isExportMode = process.env.OUTPUT === 'export'

if (isExportMode) {
  console.log('📦 Building for static export - removing /mcp route (requires server runtime)')
  
  const mcpRoutePath = join(projectRoot, 'src', 'app', 'mcp')
  
  if (existsSync(mcpRoutePath)) {
    try {
      await rm(mcpRoutePath, { recursive: true, force: true })
      console.log('✅ Removed /mcp route successfully')
    } catch (error) {
      console.warn('⚠️  Failed to remove /mcp route:', error.message)
    }
  } else {
    console.log('ℹ️  /mcp route already removed or not present')
  }
} else {
  console.log('🚀 Building for server deployment - /mcp route will be included')
}
