import { Example } from './docs/authoring/Example'
import { ExampleTable } from './docs/authoring/Example.server'
import example from './docs/authoring/Example.json'
import type { DocsConfig } from './src/config'

// The documentation uses the same extension point as any consuming repository.
export default {
  components: { Example, ExampleTable },
  scope: { example },
  markdownComponents: {
    Example: ({ initialCount }: { initialCount: number }) => `Count: ${initialCount}`,
  },
} satisfies DocsConfig
