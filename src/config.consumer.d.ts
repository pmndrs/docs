/** The actual module is selected by next.config.mts, preserving static Next imports. */
declare module 'pmndrs-docs-config' {
  const config: import('./config').DocsConfig
  export default config
}
