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
 * Check if Sandpack is available
 */
export function isSandpackAvailable(config: ExternalComponentsConfig): boolean {
  if (!config.sandpack) return false
  
  try {
    require.resolve('@codesandbox/sandpack-react')
    return true
  } catch {
    console.warn(
      'Sandpack is enabled but @codesandbox/sandpack-react is not installed. ' +
      'Run: npm install @codesandbox/sandpack-react'
    )
    return false
  }
}

/**
 * Get Sandpack component and utilities if available
 */
export async function getSandpackComponent() {
  try {
    const { Sandpack } = await import('@/components/mdx/Sandpack')
    return Sandpack
  } catch (error) {
    return null
  }
}

/**
 * Get Sandpack rehype plugin if available
 */
export async function getSandpackRehypePlugin(dir: string) {
  try {
    const { rehypeSandpack } = await import('@/components/mdx/Sandpack/rehypeSandpack')
    return rehypeSandpack(dir)
  } catch (error) {
    return null
  }
}
