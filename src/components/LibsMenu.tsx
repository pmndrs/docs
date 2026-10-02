'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LibIcon } from '@/components/LibIcon'
import { libs } from '@/libs'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'

// Where a relative `docs_url` (the docs hub's own) lives: never the current site, which is a lib's.
const DOCS_HUB_URL = 'https://docs.pmnd.rs'

// Only the libraries whose docs site is built with pmndrs/docs, i.e. has this same header.
const items = Object.entries(libs)
  .filter(([, lib]) => 'pmndrs_docs' in lib && lib.pmndrs_docs)
  .map(([id, lib]) => ({
    id: id as keyof typeof libs,
    title: lib.title,
    href: new URL(lib.docs_url, DOCS_HUB_URL).href,
  }))

/**
 * The path of `href` within the site served from `siteUrl`, or `undefined` if it is not on it.
 */
function pathOnSite(href: string, siteUrl: string) {
  const base = siteUrl.replace(/\/+$/, '')
  if (href === base) return '/'
  if (href.startsWith(`${base}/`)) return href.slice(base.length)
  return undefined
}

/**
 * The library name of the header, as a button opening the list of the pmndrs libraries documented
 * with pmndrs/docs. This site's own library leads to the home of its docs.
 */
export function LibsMenu({
  children,
  siteUrl,
}: {
  /** The library name. */
  children: React.ReactNode
  /** The public URL of this site, to find its library in the list. */
  siteUrl?: string
}) {
  // This site's own library, and the path of its docs home here (e.g. the docs hub's own docs live
  // at `/getting-started/introduction`, while its `/` is the index of all libraries).
  const currentItem = siteUrl
    ? items.find(({ href }) => pathOnSite(href, siteUrl) !== undefined)
    : undefined
  const homeHref = (currentItem && siteUrl && pathOnSite(currentItem.href, siteUrl)) || '/'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        {children}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto">
        <DropdownMenuGroup>
          {items.map(({ id, title, href }) => {
            const current = id === currentItem?.id

            return (
              <DropdownMenuItem
                key={id}
                // This site's own library stays on this site, so it also works on local and preview builds.
                render={current ? <Link href={homeHref} aria-current="true" /> : <a href={href} />}
              >
                <LibIcon id={id} size={16} className="size-4" />
                <span className="flex-1">{title}</span>
                {current && <CheckIcon />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
