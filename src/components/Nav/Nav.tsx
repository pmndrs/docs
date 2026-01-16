'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as React from 'react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import * as Collapsible from '@radix-ui/react-collapsible'
import { IoIosArrowDown } from 'react-icons/io'

type NavList = Record<string, Record<string, Doc>>

const INDEX_PAGE = 'introduction'

export function Nav({
  className,
  docs,
  asPath,
  collapsible = true,
}: React.ComponentProps<'div'> & {
  docs: Doc[]
  asPath: string
  collapsible: boolean
}) {
  const nav = React.useMemo(
    () =>
      docs.reduce((acc, doc) => {
        const page = doc.slug.at(-1)
        const category = doc.slug.at(-2) || 'root'

        acc[category] ??= {}
        if (page) acc[category][page] = doc

        return acc
      }, {} as NavList),
    [docs],
  )

  return (
    <div className={cn(className)}>
      <SidebarContent>
        {Object.entries(nav).map(([category, categoryDocs]) => {
          const docsEntries = Object.entries(categoryDocs)
          const docIndexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
          const categoryHref = docIndexEntry ? docIndexEntry[1].url : docsEntries[0][1].url
          const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)
          const isActive = docsEntries.some(([, doc]) => doc.url === `/${asPath}`)

          if (collapsible && nonIndexItems.length > 0) {
            return (
              <SidebarGroup key={category} className={cn(!isActive && 'opacity-50')}>
                <Collapsible.Root defaultOpen={isActive}>
                  <div className="relative">
                    <SidebarGroupLabel asChild>
                      <Link
                        href={categoryHref}
                        className={cn(
                          'font-bold capitalize tracking-wide',
                          docIndexEntry && categoryHref === `/${asPath}` && 'bg-primary-container',
                        )}
                      >
                        {category.replace(/\-/g, ' ')}
                      </Link>
                    </SidebarGroupLabel>
                    <Collapsible.Trigger
                      className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 transition-transform data-[state=open]:rotate-90',
                      )}
                    >
                      <IoIosArrowDown className="size-4 -rotate-90" />
                    </Collapsible.Trigger>
                  </div>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {nonIndexItems.map(([page, doc]) => (
                          <SidebarMenuItem key={page}>
                            <SidebarMenuButton asChild isActive={doc.url === `/${asPath}`}>
                              <Link href={doc.url} className="text-xs">
                                {doc.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </Collapsible.Content>
                </Collapsible.Root>
              </SidebarGroup>
            )
          }

          // Non-collapsible version
          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel asChild>
                <Link
                  href={categoryHref}
                  className={cn(
                    'font-bold capitalize tracking-wide',
                    docIndexEntry && categoryHref === `/${asPath}` && 'bg-primary-container',
                  )}
                >
                  {category.replace(/\-/g, ' ')}
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nonIndexItems.map(([page, doc]) => (
                    <SidebarMenuItem key={page}>
                      <SidebarMenuButton asChild isActive={doc.url === `/${asPath}`}>
                        <Link href={doc.url} className="text-xs">
                          {doc.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </div>
  )
}
