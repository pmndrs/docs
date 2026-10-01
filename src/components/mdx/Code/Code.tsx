'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCopied } from '@/hooks/useCopied'
import { usePackageManager } from '@/hooks/usePackageManager'
import cn from '@/lib/cn'
import {
  isPackageManager,
  packageManagers,
  type PackageManagerCommands,
} from '@/utils/packageManagers'
import { CheckIcon, CopyIcon, SquareTerminalIcon } from 'lucide-react'
import { ComponentProps, isValidElement, ReactNode, useState } from 'react'
import { CodeFileIcon } from './CodeFileIcon'

// Using a fixed color to only have 1 theme for prism. A variable too, for the fade of a collapsed
// block.
const codeBackground =
  '[--code-background:oklch(from_var(--md-sys-color-on-primary-fixed)_l_calc(c*0.2)_h)] bg-(--code-background)'
const codeText = 'text-primary-fixed'
const codeColors = cn(codeBackground, codeText)

const preClassName = 'overflow-x-auto scroll-fade-x no-scrollbar p-(--pad) font-mono text-sm'

export type CodeProps = ComponentProps<'pre'> &
  Partial<PackageManagerCommands> & {
    /** Collapsed to its first lines, with a button to expand it */
    collapsible?: boolean
  }

/**
 * A code block. Given a `title` (a ```` ```ts title="lib/utils.ts" ```` fence's, as
 * `rehypeCode` sets it), a header shows it as a file name, with the icon of its file type and the
 * copy button.
 *
 * `collapsible` (a ```` ```ts collapsible ```` fence's) shows only its first lines, with a button to
 * expand it.
 *
 * Given its command in every package manager (`pnpm`, `npm`, `yarn` and `bun`, as
 * `rehypePackageManagers` sets them), it offers them as tabs instead.
 */
export const Code = ({
  children,
  className,
  title,
  collapsible,
  pnpm,
  npm,
  yarn,
  bun,
  ...props
}: CodeProps) => {
  const [open, setOpen] = useState(false)

  if (pnpm !== undefined && npm !== undefined && yarn !== undefined && bun !== undefined) {
    return <PackageManagerCode commands={{ pnpm, npm, yarn, bun }} className={className} />
  }

  const actions = (actionsClassName: string) => (
    <CodeActions
      className={actionsClassName}
      collapsible={collapsible}
      open={open}
      getText={() => extractTextFromChildren(children)}
    />
  )

  // The frame (background, radius, margin) sits on the wrapper, not on the `<pre>`: the scroll fade
  // masks the scroller and everything it paints. The header, the actions and the fade of a
  // collapsed block, siblings, stay unmasked.
  const pre = (
    <pre {...props} className={cn(className, preClassName)}>
      {children}
    </pre>
  )

  const content = (
    <>
      {title && (
        <CodeHeader>
          <CodeFileIcon
            filename={title}
            language={className?.match(/(?:^|\s)language-(\S+)/)?.[1]}
            className="size-4 shrink-0 opacity-70"
          />
          <span className="truncate font-mono text-sm opacity-70">{title}</span>
          {actions('ml-auto')}
        </CodeHeader>
      )}
      {collapsible ? (
        // Clipped while closed, the `<pre>` still scrolling sideways inside
        <div className="overflow-hidden group-data-closed/code:max-h-64">{pre}</div>
      ) : (
        pre
      )}
      {!title && actions('absolute right-0 top-0 m-4')}
      {collapsible && (
        <CollapsibleTrigger className="absolute inset-x-0 bottom-0 flex h-20 items-center justify-center rounded-b-lg bg-linear-to-b from-(--code-background)/70 to-(--code-background) text-sm text-current/70 group-data-open/code:hidden">
          Expand
        </CollapsibleTrigger>
      )}
    </>
  )

  const frameClassName = cn('group/code relative my-5 overflow-hidden rounded-lg', codeColors)

  // Not `CollapsibleContent`: closed, Base UI hides its panel (`hidden`), where the block shows
  // its first lines. The root's `data-open`/`data-closed` clip the `<pre>` instead.
  return collapsible ? (
    <Collapsible open={open} onOpenChange={setOpen} className={frameClassName}>
      {content}
    </Collapsible>
  ) : (
    <div className={frameClassName}>{content}</div>
  )
}

/**
 * The bar above a code block's code: an icon, a name or tabs, and the copy button.
 */
function CodeHeader({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 border-b px-4 py-2">{children}</div>
}

/**
 * The buttons of a code block: expand/collapse when `collapsible`, then copy.
 */
function CodeActions({
  collapsible,
  open,
  getText,
  className,
}: {
  collapsible?: boolean
  open: boolean
  getText: () => string
  className?: string
}) {
  return (
    <div className={cn('flex items-center', className)}>
      {collapsible && (
        <>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                // Expanded, not the pressed look the ghost button takes for a menu trigger
                className="h-7 px-2 text-current/70 aria-expanded:not-hover:bg-transparent aria-expanded:not-hover:text-current/70"
              />
            }
          >
            {open ? 'Collapse' : 'Expand'}
          </CollapsibleTrigger>
          <Separator orientation="vertical" className="mx-1.5 h-4 data-vertical:self-center" />
        </>
      )}
      <CopyButton getText={getText} />
    </div>
  )
}

/**
 * The same command in every package manager, one tab each: the pick is the reader's, for every
 * command on the page (see `usePackageManager`).
 *
 * Not highlighted: the commands are plain text, the same in every tab.
 */
function PackageManagerCode({
  commands,
  className,
}: {
  commands: PackageManagerCommands
  className?: string
}) {
  const [packageManager, setPackageManager] = usePackageManager()

  return (
    <Tabs
      value={packageManager}
      onValueChange={(value) => {
        if (isPackageManager(value)) setPackageManager(value)
      }}
      className={cn('my-5 gap-0 overflow-hidden rounded-lg', codeColors)}
    >
      <CodeHeader>
        <SquareTerminalIcon className="size-4 shrink-0" />
        <TabsList aria-label="Package manager">
          {packageManagers.map((packageManager) => (
            <TabsTrigger key={packageManager} value={packageManager}>
              {packageManager}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton className="ml-auto" getText={() => commands[packageManager]} />
      </CodeHeader>
      {packageManagers.map((packageManager) => (
        <TabsContent key={packageManager} value={packageManager}>
          <pre className={cn(className, preClassName)}>
            <code className={className}>{commands[packageManager]}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}

function CopyButton({ getText, className }: { getText: () => string; className?: string }) {
  const [copied, setCopied] = useCopied()

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
    } catch {
      // Clipboard unavailable or denied: no check mark
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={handleClick}
      aria-label="Copy to clipboard"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

// Recursive function to extract text content from React nodes
const extractTextFromChildren = (children: ReactNode): string => {
  if (typeof children === 'string') {
    return children
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }

  if (isValidElement(children)) {
    const props = children.props as Record<string, unknown>
    if ('children' in props) {
      return extractTextFromChildren(props.children as ReactNode)
    }
  }

  return ''
}
