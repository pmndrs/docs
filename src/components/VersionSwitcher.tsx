'use client'

import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { ChevronsUpDownIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { deploymentUrl, versionInfo, type VersionInfo } from '@/utils/version'

/**
 * The version of the docs, at the foot of the sidebar: two lines, the version label over the
 * branch it was built from (shadcn's sidebar-01 `VersionSwitcher`).
 *
 * With a `VERSION_URL_TEMPLATE`, it opens a filterable list of the repo's branches, and picking one
 * goes to the same page on that branch's deployment. Without, it is a static label.
 */
export function VersionSwitcher() {
  const { label, branch, urlTemplate } = versionInfo

  // Without git (or with nothing it could tell), there is nothing to show.
  if (!label && !branch) return null

  const lines = (
    <div className="flex min-w-0 flex-col gap-0.5 leading-none">
      <span className="truncate font-medium">{label ?? branch}</span>
      {label && branch && <span className="truncate text-muted-foreground">{branch}</span>}
    </div>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {urlTemplate ? (
          <BranchCombobox>{lines}</BranchCombobox>
        ) : (
          // Same look as the switcher's trigger, but not a control: no hover, no press.
          <SidebarMenuButton
            size="lg"
            render={<div />}
            className="cursor-default hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
          >
            {lines}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function BranchCombobox({ children }: { children: ReactNode }) {
  // The path within the site, without its base path: the target deployment's URL (the production
  // `NEXT_PUBLIC_URL`, or the URL template expanded) is a public URL that already includes its own
  // base path, as `NEXT_PUBLIC_URL` does.
  const pathname = usePathname()

  // Base UI also commits a value from a key typed on the closed trigger (its typeahead, with
  // reason `none`): leaving the page on a stray keystroke would be a trap. Only a pick from the
  // open list -- a click, or Enter on the highlighted item -- is an `item-press`.
  function handleValueChange(
    target: string | null,
    eventDetails: ComboboxPrimitive.Root.ChangeEventDetails,
  ) {
    if (eventDetails.reason !== 'item-press') return
    void goToBranch(target)
  }

  async function goToBranch(target: string | null) {
    if (!target || target === versionInfo.branch) return

    let base: string | undefined
    try {
      base = await deploymentUrl(target, versionInfo)
    } catch (error) {
      // A malformed template (e.g. an unknown `{branch:<preset>}`): stay on the page.
      console.error(error)
      return
    }
    if (!base) return

    window.location.href = `${base}${pathname}${window.location.search}${window.location.hash}`
  }

  return (
    <Combobox
      items={versionInfo.branches}
      value={versionInfo.branch ?? null}
      onValueChange={handleValueChange}
    >
      {/* Not the shadcn `ComboboxTrigger`, which appends its own chevron. */}
      <ComboboxPrimitive.Trigger
        render={<SidebarMenuButton size="lg" />}
        aria-label={triggerLabel(versionInfo)}
        className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
      >
        {children}
        <ChevronsUpDownIcon className="ml-auto" />
      </ComboboxPrimitive.Trigger>
      {/* Above the trigger, which sits at the foot of the sidebar. */}
      <ComboboxContent side="top" align="start" aria-label="Switch branch">
        <ComboboxInput
          showTrigger={false}
          placeholder="Find a branch"
          aria-label="Filter branches"
        />
        <ComboboxEmpty>No branch found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              <span className="truncate">{item}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/** The trigger's accessible name: what it shows, then what it does. */
function triggerLabel({ label, branch }: Pick<VersionInfo, 'label' | 'branch'>): string {
  const shown = [label && `Version ${label}`, branch && `branch ${branch}`].filter(Boolean)
  return `${shown.join(', ')}. Switch deployment`
}
