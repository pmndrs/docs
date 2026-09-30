import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import cn from '@/lib/cn'
import { ComponentProps, CSSProperties } from 'react'

//
// The shadcn "sidebar-16" layout: a full-width sticky header on top, and under it the sidebar,
// the content and, from `xl`, the table of contents.
//
// import {
//   Layout,
//   LayoutAside,
//   LayoutBody,
//   LayoutContent,
//   LayoutHeader,
//   LayoutSidebar,
// } from "@/components/Layout"
//
// <Layout>
//   <LayoutHeader>header</LayoutHeader>
//   <LayoutBody>
//     <LayoutSidebar>nav</LayoutSidebar>
//     <LayoutContent>content</LayoutContent>
//     <LayoutAside>aside</LayoutAside>
//   </LayoutBody>
// </Layout>
//
// Below `lg` (see `src/hooks/use-mobile.ts`), the sidebar is a sheet a `SidebarTrigger` opens, and
// the aside is hidden until `xl`. Both take `--side-w` as their width.
//

export function Layout({ className, style, ...props }: ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider
      className={cn('flex-col', className)}
      style={{ '--sidebar-width': 'var(--side-w)', ...style } as CSSProperties}
      {...props}
    />
  )
}

/** Above the sidebar (`z-10`), which starts right under the header and would cover its border. */
export function LayoutHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cn('sticky top-0 z-20', className)} {...props} />
}

export function LayoutBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-1 gap-x-(--rgrid-g)', className)} {...props} />
}

/**
 * The desktop sidebar is `sticky` under the header, like the TOC, rather than shadcn's `fixed`: in
 * the flow, it follows the page when it bounces past its ends (macOS overscroll), as the header
 * does. The classes land on `sidebar-container`, which sits under a zero-height `sidebar-gap` in
 * the same block, so the two stack and the width is not counted twice. The offcanvas collapse
 * slides it out with a negative margin, which also takes its width out of the row, instead of the
 * `left` offset a `fixed` box moves by (`left` only sets a threshold on a `sticky` one). The
 * mobile sheet takes none of this: `className` only reaches the desktop container.
 */
export function LayoutSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      className={cn(
        'sticky top-(--header-height) bottom-auto h-[calc(100svh-var(--header-height))]',
        'data-[side=left]:left-auto data-[side=left]:group-data-[collapsible=offcanvas]:left-auto',
        'transition-[margin] group-data-[collapsible=offcanvas]:-ml-(--sidebar-width)',
        // No panel edge: the sidebar is part of the page, as the nav it replaced was.
        'group-data-[side=left]:border-r-0',
        className,
      )}
      {...props}
    />
  )
}

export function LayoutContent({ className, ...props }: ComponentProps<typeof SidebarInset>) {
  return <SidebarInset className={cn('min-w-0', className)} {...props} />
}

export function LayoutAside({ className, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'hidden w-(--side-w) shrink-0 overflow-auto xl:block',
        'sticky top-(--header-height) h-[calc(100dvh-var(--header-height))]',
        className,
      )}
      {...props}
    />
  )
}
