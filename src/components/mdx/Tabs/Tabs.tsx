import { cn } from '@/lib/utils'
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs'
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react'
import { SyncedTabs } from './SyncedTabs'
import { TabsAnchor } from './TabsAnchor'

//
// shadcn's Tabs (https://ui.shadcn.com/docs/components/base/tabs), as is: the same parts, the
// same props. Only their default look differs — a row of text tabs, the active one underlined,
// as the "Base UI | Radix UI" switcher of the shadcn docs. A `className` adds to it.
//
// Server components: no state of their own, so they work in MDX compiled on the server
// (next-mdx-remote/rsc), handing everything to the client ui ones. Only a `Tabs` with a `syncKey`
// renders a client root of its own, `SyncedTabs`, its panels still rendered on the server.
//

//
// Base UI types `className` as a string or a function of the part's state, but `cn()` drops
// functions: only a string is accepted.
//
type WithStringClassName<P> = Omit<P, 'className'> & { className?: string }

type TabsProps = WithStringClassName<Omit<ComponentProps<typeof UiTabs>, 'defaultValue'>> & {
  defaultValue: NonNullable<ComponentProps<typeof UiTabs>['defaultValue']>
  syncKey?: string
}

/**
 * Alternative contents, one shown at a time, e.g. the same component in React, Vue and Svelte.
 *
 * - `defaultValue`: the `value` of the tab shown first. Without it, no tab is shown in the
 *   HTML, and Base UI only picks the first one once the page's JavaScript runs.
 * - `syncKey`: every `Tabs` of the same `syncKey` shows the tab picked last in any of them, on
 *   this page and the others, after a reload, in other browser tabs (see `SyncedTabs`). The HTML
 *   still shows `defaultValue`: the picked tab only once the page's JavaScript runs.
 *
 * A `#hash` pointing into a panel not shown, e.g. the anchor of a heading in a `TabsContent`,
 * opens its tab and scrolls to it: on load, when the hash changes, and when a link to it is
 * clicked.
 */
export function Tabs({ syncKey, className, children, ...props }: TabsProps) {
  // `.post-container > *` (globals.css) makes this root `display: block` instead of the ui
  // `Tabs`' flex column. Fine: with `gap-0`, block flow stacks the list and panels the same way.
  const rootClassName = cn('my-6 gap-0', className)

  const content = (
    <>
      {children}
      <TabsAnchor />
    </>
  )

  return syncKey ? (
    <SyncedTabs
      syncKey={syncKey}
      values={triggerValues(children)}
      className={rootClassName}
      {...props}
    >
      {content}
    </SyncedTabs>
  ) : (
    <UiTabs className={rootClassName} {...props}>
      {content}
    </UiTabs>
  )
}

/**
 * The `value` of each `TabsTrigger` in `children`, those of a nested `Tabs` aside.
 *
 * `SyncedTabs` only shows a pick one of them has: the ui `Tabs` shows no tab at all for a value it
 * doesn't have. Read from the elements as written, before they render: a `TabsTrigger` rendered by
 * another component is not found, and a pick of its tab is ignored, as one the `Tabs` doesn't have.
 */
function triggerValues(children: ReactNode): string[] {
  const values: string[] = []
  Children.forEach(children, (child) => {
    // Text, or a nested `Tabs`: its triggers are its own
    if (!isValidElement<{ value?: unknown; children?: ReactNode }>(child) || child.type === Tabs) {
      return
    }

    // Strings only, as MDX gives its attributes and localStorage keeps them
    if (child.type === TabsTrigger) {
      if (typeof child.props.value === 'string') values.push(child.props.value)
      return
    }

    values.push(...triggerValues(child.props.children))
  })
  return values
}

/**
 * The row of `TabsTrigger`s: text, no box — no height or padding of its own. The `line`
 * variant by default. It wraps onto more lines when the triggers don't fit, e.g. on a phone.
 */
export function TabsList({
  variant = 'line',
  className,
  ...props
}: WithStringClassName<ComponentProps<typeof UiTabsList>>) {
  return (
    <UiTabsList
      variant={variant}
      className={cn(
        // `gap-y-2` keeps a wrapped line clear of the underline above it (`after:bottom-[-4px]`)
        'w-full flex-wrap justify-start gap-x-6 gap-y-2 p-0 group-data-horizontal/tabs:h-auto',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A tab, its `value` naming the `TabsContent` it shows. Text as large as the page's: no pill,
 * no padding, its natural width. The underline under the active one only is the `line`
 * variant's.
 */
export function TabsTrigger({
  className,
  ...props
}: WithStringClassName<ComponentProps<typeof UiTabsTrigger>>) {
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
}: WithStringClassName<ComponentProps<typeof UiTabsContent>>) {
  return (
    <UiTabsContent keepMounted={keepMounted} className={cn('text-base', className)} {...props} />
  )
}
