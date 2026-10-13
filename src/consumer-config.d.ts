/** The actual module is selected by next.config.mjs, preserving static Next imports. */
declare module 'pmndrs-docs-config' {
  const config: import('./docs.config').DocsConfig
  export default config
}
