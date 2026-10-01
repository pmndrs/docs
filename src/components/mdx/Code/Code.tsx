'use client'

import { Button } from '@/components/ui/button'
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
import { ComponentProps, isValidElement, ReactNode } from 'react'

// Using a fixed color to only have 1 theme for prism
const codeBackground = 'bg-[oklch(from_var(--md-sys-color-on-primary-fixed)_l_calc(c*0.2)_h)]'
const codeText = 'text-primary-fixed'
const codeColors = cn(codeBackground, codeText)

export type CodeProps = ComponentProps<'pre'> & Partial<PackageManagerCommands>

/**
 * A code block. Given its command in every package manager (`pnpm`, `npm`, `yarn` and `bun`, as
 * `rehypePackageManagers` sets them), it offers them as tabs.
 */
export const Code = ({ children, className, pnpm, npm, yarn, bun, ...props }: CodeProps) => {
  if (pnpm !== undefined && npm !== undefined && yarn !== undefined && bun !== undefined) {
    return <PackageManagerCode commands={{ pnpm, npm, yarn, bun }} className={className} />
  }

  // The frame (background, radius, margin) sits on the wrapper, not on the `<pre>`: the scroll fade
  // masks the scroller and everything it paints. The copy button, a sibling, stays unmasked.
  return (
    <div className={cn('relative my-5 overflow-hidden rounded-lg', codeColors)}>
      <pre
        {...props}
        className={cn(
          className,
          'overflow-x-auto scroll-fade-x no-scrollbar p-(--pad) font-mono text-sm',
        )}
      >
        {children}
      </pre>
      <CopyButton
        className="absolute right-0 top-0 m-4"
        getText={() => extractTextFromChildren(children)}
      />
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
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <SquareTerminalIcon className="size-4 shrink-0" />
        <TabsList aria-label="Package manager">
          {packageManagers.map((packageManager) => (
            <TabsTrigger key={packageManager} value={packageManager}>
              {packageManager}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton className="ml-auto" getText={() => commands[packageManager]} />
      </div>
      {packageManagers.map((packageManager) => (
        <TabsContent key={packageManager} value={packageManager}>
          <pre
            className={cn(
              className,
              'overflow-x-auto scroll-fade-x no-scrollbar p-(--pad) font-mono text-sm',
            )}
          >
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
