'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { toggleLib, type Selection } from './selection'

/**
 * Which libraries the graph shows: a menu of every library with its count in the window, and the
 * selected ones as chips that remove themselves.
 */
export function LibFilter({
  libs,
  counts,
  selection,
  onChange,
}: {
  /** Every library on offer, in the order to list them. */
  libs: string[]
  counts: Map<string, number>
  selection: Selection
  onChange: (selection: Selection) => void
}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          {selection.length === 0 ? 'All libraries' : `${selection.length} selected`}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={selection.length === 0}
              onCheckedChange={() => onChange([])}
            >
              All libraries
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {libs.map((lib) => (
              <DropdownMenuCheckboxItem
                key={lib}
                checked={selection.includes(lib)}
                onCheckedChange={() => onChange(toggleLib(selection, lib))}
              >
                <span className="truncate">{lib}</span>
                <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                  {counts.get(lib) ?? 0}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {selection.map((lib) => (
        <Button
          key={lib}
          variant="secondary"
          size="sm"
          aria-label={`Remove ${lib} from the selection`}
          onClick={() => onChange(toggleLib(selection, lib))}
        >
          {lib}
          <XIcon data-icon="inline-end" />
        </Button>
      ))}
    </>
  )
}
