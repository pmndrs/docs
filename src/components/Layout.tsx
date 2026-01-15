import cn from '@/lib/cn'
import { ComponentProps } from 'react'

//
// https://codepen.io/abernier/pen/dyBwQqq?editors=1100
//
// import {
//   Layout,
//   LayoutContent,
//   LayoutHeader,
//   LayoutNav,
//   LayoutAside,
// } from "@/components/Layout"
//
// <Layout>
//   <LayoutHeader>header</LayoutHeader>
//   <LayoutContent>content</LayoutContent>
//   <LayoutNav>nav</LayoutNav>
//   <LayoutAside>aside</LayoutAside>
// </Layout>
//

// see: tailwind.config.ts for grid-areas-* values

export function Layout({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid min-h-dvh gap-x-[--rgrid-g]',
        [
          'grid-cols-[1fr] grid-rows-[var(--header-height)_1fr] grid-areas-layout-1col',
          'lg:grid-cols-[var(--side-w)_1fr] lg:grid-areas-layout-2cols',
          'xl:grid-cols-[var(--side-w)_1fr_var(--side-w)] xl:grid-areas-layout-3cols',
        ],
        className,
      )}
      {...props}
    />
  )
}

export function LayoutContent({ className, ...props }: ComponentProps<'main'>) {
  return <main className={cn('min-w-0 grid-in-m', className)} {...props} />
}

export function LayoutHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cn('sticky top-0 bg-red-200/50 grid-in-h', className)} {...props} />
}

export function LayoutNav({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        'hidden overflow-auto lg:[display:initial]',
        'sticky top-[--header-height] h-[calc(100dvh-var(--header-height))] grid-in-n',
        className,
      )}
      {...props}
    />
  )
}

export function LayoutAside({ className, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'hidden overflow-auto xl:[display:initial]',
        'sticky top-[--header-height] h-[calc(100dvh-var(--header-height))] grid-in-t',
        className,
      )}
      {...props}
    />
  )
}
