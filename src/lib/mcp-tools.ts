/**
 * Shared MCP tools business logic for both remote and local servers.
 * This module contains the core logic for listing pages and getting page content
 * from llms-full.txt files, using Cheerio for XML parsing.
 */

import * as cheerio from 'cheerio'

/**
 * Data source interface - allows different implementations for remote vs local
 */
export interface DataSource {
  /**
   * Fetch the llms-full.txt content for a given library
   */
  fetchLlmsFullText(libKey: string): Promise<string>
  
  /**
   * Get list of available library names
   */
  getAvailableLibraries(): string[]
}

/**
 * List all available page paths for a library
 */
export async function listPages(dataSource: DataSource, lib: string): Promise<string[]> {
  const fullText = await dataSource.fetchLlmsFullText(lib)
  const $ = cheerio.load(fullText, { xmlMode: true })

  const paths = $('page')
    .map((_, el) => $(el).attr('path'))
    .get()
    .filter((path): path is string => typeof path === 'string')

  return paths
}

/**
 * Get the content of a specific page
 */
export async function getPageContent(
  dataSource: DataSource,
  lib: string,
  path: string,
): Promise<string> {
  const fullText = await dataSource.fetchLlmsFullText(lib)
  const $ = cheerio.load(fullText, { xmlMode: true })

  // Use .filter() to avoid CSS selector injection
  const page = $('page').filter((_, el) => $(el).attr('path') === path)
  
  if (page.length === 0) {
    throw new Error(`Page not found: ${path}`)
  }

  return page.text().trim()
}
