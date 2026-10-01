import { isPackageManager, type PackageManager } from '@/utils/packageManagers'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'pmndrs-docs:package-manager'
const DEFAULT_PACKAGE_MANAGER: PackageManager = 'pnpm'

// The selection of this page, read from localStorage once, then kept here: it still works when
// localStorage is unavailable (blocked, private mode…), only without being remembered.
let selected: PackageManager | undefined
const listeners = new Set<() => void>()

function readStorage(): PackageManager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isPackageManager(stored)) return stored
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_PACKAGE_MANAGER
}

function writeStorage(packageManager: PackageManager) {
  try {
    localStorage.setItem(STORAGE_KEY, packageManager)
  } catch {
    // localStorage unavailable
  }
}

function subscribe(listener: () => void) {
  // Another tab changed it
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    selected = readStorage()
    listener()
  }

  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  if (selected === undefined) selected = readStorage()
  return selected
}

function getServerSnapshot() {
  return DEFAULT_PACKAGE_MANAGER
}

function setPackageManager(packageManager: PackageManager) {
  selected = packageManager
  writeStorage(packageManager)
  for (const listener of listeners) listener()
}

/**
 * The package manager the reader picked for terminal commands, `pnpm` by default: one choice for
 * every command of the page, remembered across pages, reloads and tabs.
 */
export function usePackageManager() {
  const packageManager = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return [packageManager, setPackageManager] as const
}
