'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as React from 'react'
import Link from 'next/link'
import * as Collapsible from '@radix-ui/react-collapsible'
import { IoIosArrowDown } from 'react-icons/io'
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
    <Sidebar collapsible="none" className={cn(className)}>
      <SidebarContent>
        {Object.entries(nav).map(([category, categoryDocs]) => {
          const docsEntries = Object.entries(categoryDocs)
          const docIndexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
          const categoryHref = docIndexEntry ? docIndexEntry[1].url : docsEntries[0][1].url
          const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)
          const isActive = docsEntries.some(([, doc]) => doc.url === `/${asPath}`)

          if (collapsible && nonIndexItems.length > 0) {
            return (
              <Collapsible.Root key={category} defaultOpen={isActive}>
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <div className="flex items-center justify-between">
                      <Link
                        href={categoryHref}
                        className={cn(
                          'flex-1 capitalize',
                          docIndexEntry && categoryHref === `/${asPath}` && 'font-bold',
                        )}
                      >
                        {category.replace(/\-/g, ' ')}
                      </Link>
                      <Collapsible.Trigger className="flex items-center justify-center p-2">
                        <IoIosArrowDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                      </Collapsible.Trigger>
                    </div>
                  </SidebarGroupLabel>
                  <Collapsible.Content>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {nonIndexItems.map(([page, doc]) => (
                          <SidebarMenuItem key={page}>
                            <SidebarMenuButton asChild isActive={doc.url === `/${asPath}`}>
                              <Link href={doc.url}>{doc.title}</Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </Collapsible.Content>
                </SidebarGroup>
              </Collapsible.Root>
            )
          }

          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel asChild>
                <Link
                  href={categoryHref}
                  className={cn(
                    'capitalize',
                    docIndexEntry && categoryHref === `/${asPath}` && 'font-bold',
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
                        <Link href={doc.url}>{doc.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
