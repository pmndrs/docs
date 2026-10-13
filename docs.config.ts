import { Example } from './docs/authoring/Example'
import example from './docs/authoring/Example.json'
import type { DocsConfig } from './src/config'

// The documentation uses the same extension point as any consuming repository.
export default {
  components: { Example },
  scope: { example },
} satisfies DocsConfig
