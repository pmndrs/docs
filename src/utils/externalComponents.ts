/**
 * External components registry
 * 
 * This module handles the loading and registration of external MDX components.
 * External components are optional and can be enabled/disabled via environment variables.
 */

type ExternalComponentsConfig = {
  sandpack?: boolean
}

/**
 * Load external components configuration from environment variables
 * 
 * Environment variables:
 * - EXTERNAL_SANDPACK: Set to 'false' to disable Sandpack component
 * 
 * By default, all external components are enabled for backward compatibility.
 */
export async function loadExternalComponentsConfig(): Promise<ExternalComponentsConfig> {
  const sandpackEnabled = process.env.EXTERNAL_SANDPACK !== 'false'
  
  return {
    sandpack: sandpackEnabled,
  }
}

/**
 * Check if Sandpack package is installed
 */
export function isSandpackInstalled(): boolean {
  try {
    require.resolve('@codesandbox/sandpack-react')
    return true
  } catch {
    return false
  }
}

/**
 * Check if Sandpack is available (enabled and installed)
 */
export function isSandpackAvailable(config: ExternalComponentsConfig): boolean {
  return Boolean(config.sandpack) && isSandpackInstalled()
}

/**
 * Get Sandpack component and utilities if available
 * Returns the Sandpack component if enabled and available,
 * or a placeholder component otherwise.
 */
export async function getSandpackComponent() {
  const config = await loadExternalComponentsConfig()
  
  // If Sandpack is disabled, return placeholder
  if (!config.sandpack) {
    const { SandpackPlaceholder } = await import('@/components/mdx/Sandpack/SandpackPlaceholder')
    return SandpackPlaceholder
  }
  
  // If Sandpack is enabled, try to load it
  try {
    const { Sandpack } = await import('@/components/mdx/Sandpack')
    return Sandpack
  } catch (error) {
    // If Sandpack import fails (not installed), return placeholder
    console.warn('Sandpack is enabled but @codesandbox/sandpack-react is not installed.')
    const { SandpackPlaceholder } = await import('@/components/mdx/Sandpack/SandpackPlaceholder')
    return SandpackPlaceholder
  }
}

/**
 * Get Sandpack rehype plugin if available
 * Returns null if Sandpack is disabled or not available
 */
export async function getSandpackRehypePlugin(dir: string) {
  const config = await loadExternalComponentsConfig()
  
  // If Sandpack is disabled, don't load the plugin
  if (!config.sandpack) {
    return null
  }
  
  try {
    const { rehypeSandpack } = await import('@/components/mdx/Sandpack/rehypeSandpack')
    return rehypeSandpack(dir)
  } catch (error) {
    return null
  }
}
