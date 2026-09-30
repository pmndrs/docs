'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import cn from '@/lib/cn'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

/** The page a category's own entry links to, instead of listing it under the category. */
const INDEX_PAGE = 'introduction'

/**
 * The shape of the nav this replaced, on shadcn's buttons: flush with the sidebar's left edge,
 * a pill on the right only, the label lined up with the header's logo.
 */
const ITEM_SHAPE = 'h-auto rounded-none rounded-r-full py-(--NavItem-pad) pl-(--rgrid-m)'

/**
 * Hovered, a row takes a fainter accent than the current page's, so the two tell apart. Only on
 * the rows that are not current: a current row keeps shadcn's full accent when hovered.
 */
// Pressing a row keeps its hover look: shadcn's `active:` full accent would flash on every click.
const HOVER_SOFT =
  'hover:bg-sidebar-accent/40 hover:text-sidebar-foreground active:bg-sidebar-accent/40 active:text-sidebar-foreground'

export type SidebarNavDoc = Pick<Doc, 'slug' | 'url' | 'title'>

/**
 * The docs navigation: one entry per category (the parent folder of a page, or `root`), each
 * listing its pages. A category links to its `introduction` page, or to its first page when it
 * has none, and starts open when it holds the current page.
 */
export function SidebarNav({ docs, asPath }: { docs: SidebarNavDoc[]; asPath: string }) {
  const { setOpenMobile } = useSidebar()

  // On mobile the sidebar is a sheet over the page: close it once a page is picked.
  const closeMobile = () => setOpenMobile(false)

  const currentUrl = `/${asPath}`

  const categories = new Map<string, Map<string, SidebarNavDoc>>()
  for (const doc of docs) {
    const page = doc.slug.at(-1)
    const category = doc.slug.at(-2) || 'root'

    if (!categories.has(category)) categories.set(category, new Map())
    if (page) categories.get(category)!.set(page, doc)
  }

  // `--NavSub-offset`: how far the pages' list sits from the edge, its indent and tree line.
  return (
    <SidebarContent className="[--NavItem-pad:--spacing(3)] [--NavSub-offset:calc(var(--rgrid-m)+1px)]">
      <SidebarGroup className="p-0 pt-8">
        <SidebarMenu className="gap-0">
          {[...categories].map(([category, pages]) => {
            const label = category.replace(/-/g, ' ')

            const indexDoc = pages.get(INDEX_PAGE)
            const categoryHref = indexDoc ? indexDoc.url : [...pages.values()][0].url
            const subDocs = [...pages].filter(([page]) => page !== INDEX_PAGE).map(([, doc]) => doc)

            const containsCurrent = [...pages.values()].some((doc) => doc.url === currentUrl)
            const isCategoryActive = !!indexDoc && indexDoc.url === currentUrl

            const categoryButton = (
              <SidebarMenuButton
                render={<Link href={categoryHref} />}
                isActive={isCategoryActive}
                aria-current={isCategoryActive ? 'page' : undefined}
                onClick={closeMobile}
                className={cn(
                  ITEM_SHAPE,
                  // The row lights up while its chevron is hovered too, as when it is hovered.
                  !isCategoryActive && [
                    HOVER_SOFT,
                    'group-has-[[data-sidebar=menu-action]:hover]/menu-item:bg-sidebar-accent/40',
                  ],
                )}
              >
                <span className="capitalize tracking-wide">{label}</span>
              </SidebarMenuButton>
            )

            // The categories away from the current page step back.
            const itemClassName = cn(!containsCurrent && 'opacity-50')

            if (subDocs.length === 0) {
              return (
                <SidebarMenuItem key={category} className={itemClassName}>
                  {categoryButton}
                </SidebarMenuItem>
              )
            }

            return (
              <Collapsible
                key={category}
                defaultOpen={containsCurrent}
                render={<SidebarMenuItem />}
                className={itemClassName}
              >
                {categoryButton}
                <CollapsibleTrigger
                  render={<SidebarMenuAction />}
                  aria-label={label}
                  // A circle inscribed in the pill's round end: the row is 2.75rem tall, the
                  // button 2.25rem, inset 0.25rem on the top and right. Set on the category's row
                  // (not on the item, which holds the pages too): `!` outranks the action's own
                  // `peer-data-[size=default]/menu-button:top-2`. Hovered or focused, it takes
                  // shadcn's secondary colours, to stand out from the row, lit in the accent.
                  className="top-1! right-1 w-9 rounded-full hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground data-panel-open:rotate-90"
                >
                  <ChevronRightIcon />
                </CollapsibleTrigger>
                {/* Base UI measures the panel into `--collapsible-panel-height` and flags the first
                 * and last frames of the transition, so the height eases in and out of 0. A panel
                 * open on the first render does not animate. */}
                <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0">
                  {/* shadcn's tree line, under the start of the category's label. It is drawn
                   * over the pages instead (`before:`, shadcn's own border made transparent), as a
                   * page's highlight reaches back over it: in the page header's rule colour,
                   * translucent, so it still shows, fainter, across a lit row. `translate-none`
                   * (not shadcn's `translate-x-px`) keeps the list on `--NavSub-offset`. */}
                  <SidebarMenuSub className="relative mr-0 ml-(--rgrid-m) translate-none gap-0 border-transparent px-0 py-0 before:pointer-events-none before:absolute before:inset-y-0 before:-left-px before:z-10 before:w-px before:bg-outline-variant/50">
                    {subDocs.map((doc) => {
                      const isActive = doc.url === currentUrl

                      return (
                        <SidebarMenuSubItem key={doc.url}>
                          <SidebarMenuSubButton
                            render={<Link href={doc.url} />}
                            isActive={isActive}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={closeMobile}
                            size="sm"
                            className={cn(
                              // Reaches back over the list's indent and tree line, so the highlight
                              // is flush with the edge like a category's; the padding puts the
                              // label back.
                              '-ml-(--NavSub-offset) h-auto translate-x-0 rounded-none rounded-r-full py-(--NavItem-pad) pl-[calc(var(--NavSub-offset)+var(--NavItem-pad))]',
                              !isActive && HOVER_SOFT,
                            )}
                          >
                            <span>{doc.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}
