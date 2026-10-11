import { Item, ItemContent, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import {
  InfoIcon,
  LightbulbIcon,
  MessageSquareWarningIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { p as P } from '@/components/mdx'

type Style = {
  icon: LucideIcon
  label: string
  colors: string
}

const styles: Record<string, Style> = {
  NOTE: {
    icon: InfoIcon,
    label: 'Note',
    colors: 'bg-note-container text-on-note-container',
  },
  TIP: {
    icon: LightbulbIcon,
    label: 'Tip',
    colors: 'bg-tip-container text-on-tip-container',
  },
  IMPORTANT: {
    icon: MessageSquareWarningIcon,
    label: 'Important',
    colors: 'bg-important-container text-on-important-container',
  },
  WARNING: {
    icon: TriangleAlertIcon,
    label: 'Warning',
    colors: 'bg-warning-container text-on-warning-container',
  },
  CAUTION: {
    icon: OctagonAlertIcon,
    label: 'Caution',
    colors: 'bg-caution-container text-on-caution-container',
  },
}

type GhaProps = {
  /** Rich article content displayed under the callout label. */
  children: ReactNode
  /** GitHub alert kind; missing or unknown kinds render a note. */
  keyword?: string
  /** Optional label that keeps the keyword's semantic colors and icon. */
  title?: string
}

/**
 * A static editorial callout using GitHub alert kinds and their Material color pairs.
 */
export function Gha({ children, keyword, title }: GhaProps) {
  if (!keyword || !Object.hasOwn(styles, keyword)) keyword = 'NOTE'

  const { icon, label: defaultLabel, colors } = styles[keyword]
  const label = title ?? defaultLabel
  const Icon = icon

  // test if children is a string
  if (typeof children === 'string') {
    children = <P className="my-4">{children}</P>
  }

  return (
    <div className="my-6">
      <Item role="note" aria-label={label} className={colors}>
        <ItemHeader className="justify-start">
          <ItemMedia variant="icon">
            <Icon aria-hidden />
          </ItemMedia>
          <ItemTitle className="min-w-0 flex-1 line-clamp-none break-words">{label}</ItemTitle>
        </ItemHeader>
        <ItemContent className="min-w-0 basis-full">
          <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
        </ItemContent>
      </Item>
    </div>
  )
}
