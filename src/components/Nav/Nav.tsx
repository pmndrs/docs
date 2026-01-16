'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as React from 'react'
import Link from 'next/link'
import * as Collapsible from '@radix-ui/react-collapsible'
import { IoIosArrowDown } from 'react-icons/io'

type NavList = Record<string, Record<string, Doc>>

const INDEX_PAGE = 'introduction'

// Simplified sidebar components without context dependency
function NavGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-sidebar="group" className={cn('flex w-full flex-col', className)}>
      {children}
    </div>
  )
}

function NavGroupLabel({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}) {
  const Comp = asChild ? 'div' : 'div'
  return (
    <Comp
      data-sidebar="group-label"
      className={cn(
        'flex shrink-0 items-center text-sm font-semibold text-on-surface-variant px-3 py-2',
        className,
      )}
    >
      {children}
    </Comp>
  )
}

function NavGroupContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div data-sidebar="group-content" className={cn('w-full', className)}>
      {children}
    </div>
  )
}

function NavMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)}>
      {children}
    </ul>
  )
}

function NavMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li data-sidebar="menu-item" className={cn('group/menu-item relative', className)}>
      {children}
    </li>
  )
}

function NavMenuButton({
  children,
  className,
  isActive,
  asChild,
  ...props
}: (React.ComponentProps<'button'> | React.ComponentProps<'div'>) & {
  isActive?: boolean
  asChild?: boolean
}) {
  const Comp = asChild ? 'div' : 'button'
  return (
    <Comp
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none',
        'hover:bg-surface-container-highest transition-colors',
        isActive && 'bg-primary-container text-on-primary-container font-medium',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </Comp>
  )
}

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
    <div className={cn(className, 'flex flex-col gap-2 p-2')}>
      {Object.entries(nav).map(([category, categoryDocs]) => {
        const docsEntries = Object.entries(categoryDocs)
        const docIndexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
        const categoryHref = docIndexEntry ? docIndexEntry[1].url : docsEntries[0][1].url
        const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)
        const isActive = docsEntries.some(([, doc]) => doc.url === `/${asPath}`)

        if (collapsible && nonIndexItems.length > 0) {
          return (
            <Collapsible.Root key={category} defaultOpen={isActive}>
              <NavGroup>
                <NavGroupLabel asChild>
                  <div className="flex items-center justify-between">
                    <Link
                      href={categoryHref}
                      className={cn(
                        'flex-1 capitalize hover:text-on-surface',
                        docIndexEntry && categoryHref === `/${asPath}` && 'font-bold',
                      )}
                    >
                      {category.replace(/\-/g, ' ')}
                    </Link>
                    <Collapsible.Trigger className="flex items-center justify-center p-2 hover:bg-surface-container-high rounded">
                      <IoIosArrowDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                    </Collapsible.Trigger>
                  </div>
                </NavGroupLabel>
                <Collapsible.Content>
                  <NavGroupContent>
                    <NavMenu>
                      {nonIndexItems.map(([page, doc]) => (
                        <NavMenuItem key={page}>
                          <NavMenuButton asChild isActive={doc.url === `/${asPath}`}>
                            <Link href={doc.url}>{doc.title}</Link>
                          </NavMenuButton>
                        </NavMenuItem>
                      ))}
                    </NavMenu>
                  </NavGroupContent>
                </Collapsible.Content>
              </NavGroup>
            </Collapsible.Root>
          )
        }

        return (
          <NavGroup key={category}>
            <NavGroupLabel asChild>
              <Link
                href={categoryHref}
                className={cn(
                  'capitalize hover:text-on-surface',
                  docIndexEntry && categoryHref === `/${asPath}` && 'font-bold',
                )}
              >
                {category.replace(/\-/g, ' ')}
              </Link>
            </NavGroupLabel>
            <NavGroupContent>
              <NavMenu>
                {nonIndexItems.map(([page, doc]) => (
                  <NavMenuItem key={page}>
                    <NavMenuButton asChild isActive={doc.url === `/${asPath}`}>
                      <Link href={doc.url}>{doc.title}</Link>
                    </NavMenuButton>
                  </NavMenuItem>
                ))}
              </NavMenu>
            </NavGroupContent>
          </NavGroup>
        )
      })}
    </div>
  )
}
