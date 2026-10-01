import cn from '@/lib/cn'
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs'
import type { ComponentProps } from 'react'

//
// shadcn's Tabs (https://ui.shadcn.com/docs/components/base/tabs), as is: the same parts, the
// same props. Only their default look differs — a row of text tabs, the active one underlined,
// as the "Base UI | Radix UI" switcher of the shadcn docs. A `className` adds to it.
//
// Server components: no state of their own, so they work in MDX compiled on the server
// (next-mdx-remote/rsc), handing everything to the client ui ones.
//

/**
 * Alternative contents, one shown at a time, e.g. the same component in React, Vue and Svelte.
 *
 * - `defaultValue`: the `value` of the tab shown first. Without it, no tab is shown in the
 *   HTML, and Base UI only picks the first one once the page's JavaScript runs.
 */
export function Tabs({ className, ...props }: ComponentProps<typeof UiTabs>) {
  return (
    // Wrapped: `.post-container > *` (globals.css) forces `display: block` on the article's
    // children, which would undo the column the ui `Tabs` lays its list and panels out in.
    <div className="my-6">
      <UiTabs className={cn('gap-0', className)} {...props} />
    </div>
  )
}

/**
 * The row of `TabsTrigger`s: text, no box — no height, padding or gap of its own. The `line`
 * variant by default.
 */
export function TabsList({
  variant = 'line',
  className,
  ...props
}: ComponentProps<typeof UiTabsList>) {
  return (
    <UiTabsList
      variant={variant}
      className={cn('w-full justify-start gap-6 p-0 group-data-horizontal/tabs:h-auto', className)}
      {...props}
    />
  )
}

/**
 * A tab, its `value` naming the `TabsContent` it shows. Text as large as the page's: no pill,
 * no padding, its natural width. The underline under the active one only is the `line`
 * variant's.
 */
export function TabsTrigger({ className, ...props }: ComponentProps<typeof UiTabsTrigger>) {
  return (
    <UiTabsTrigger
      className={cn(
        'flex-none rounded-md px-0 pt-1 pb-0.5 text-base text-muted-foreground group-data-horizontal/tabs:after:bottom-[-4px]',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The content of the `TabsTrigger` of the same `value`, at the page's text size, not the ui
 * panel's smaller one.
 *
 * - `keepMounted`: on by default, every panel in the HTML, not only the active one — found by
 *   search engines
 */
export function TabsContent({
  keepMounted = true,
  className,
  ...props
}: ComponentProps<typeof UiTabsContent>) {
  return (
    <UiTabsContent keepMounted={keepMounted} className={cn('text-base', className)} {...props} />
  )
}
