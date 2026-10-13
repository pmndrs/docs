import { validateDocsConfig } from '@/config'
import consumerConfig from 'pmndrs-docs-config'
import { fragmentComponents } from './compile'

const config = validateDocsConfig(consumerConfig)

/**
 * Uses the website's consumer scope and overrides on top of static fragment defaults.
 */
export const fragmentConfig = {
  ...config,
  components: { ...fragmentComponents, ...config.components },
}
