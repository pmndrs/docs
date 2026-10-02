import { isPackageManager, type PackageManager } from '@/utils/packageManagers'
import { useStoredChoice } from '@/hooks/useStoredChoice'

const STORAGE_KEY = 'pmndrs-docs:package-manager'
const DEFAULT_PACKAGE_MANAGER: PackageManager = 'pnpm'

/**
 * The package manager the reader picked for terminal commands, `pnpm` by default: one choice for
 * every command of the page, remembered across pages, reloads and tabs (see `useStoredChoice`).
 */
export function usePackageManager() {
  const [stored, setStored] = useStoredChoice(STORAGE_KEY)
  const packageManager = isPackageManager(stored) ? stored : DEFAULT_PACKAGE_MANAGER
  const setPackageManager: (packageManager: PackageManager) => void = setStored
  return [packageManager, setPackageManager] as const
}
