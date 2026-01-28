'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

type NavList = Record<string, Record<string, Doc>>

const INDEX_PAGE = 'introduction'

export function NavContent({ docs, asPath }: { docs: Doc[]; asPath: string }) {
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
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {Object.entries(nav).map(([category, categoryDocs]) => {
              const docsEntries = Object.entries(categoryDocs)
              const docIndexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
              const categoryHref = docIndexEntry ? docIndexEntry[1].url : docsEntries[0][1].url
              const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)
              const isActive = docsEntries.some(([, doc]) => doc.url === `/${asPath}`)

              return (
                <Collapsible key={category} className="group/collapsible" defaultOpen={isActive}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={docIndexEntry && categoryHref === `/${asPath}`}
                    >
                      <Link href={categoryHref} className="font-bold capitalize">
                        {category.replace(/\-/g, ' ')}
                      </Link>
                    </SidebarMenuButton>
                    {nonIndexItems.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 opacity-70 outline-hidden transition-transform hover:opacity-100',
                            'group-data-[state=open]/collapsible:rotate-90',
                          )}
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </CollapsibleTrigger>
                    )}
                    {nonIndexItems.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {nonIndexItems.map(([page, doc]) => (
                            <SidebarMenuSubItem key={page}>
                              <SidebarMenuSubButton asChild isActive={doc.url === `/${asPath}`}>
                                <Link href={doc.url}>{doc.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
