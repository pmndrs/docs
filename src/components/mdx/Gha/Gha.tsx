import { cn } from '@/lib/utils'
import {
  InfoIcon,
  LightbulbIcon,
  MessageSquareWarningIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react'
import { ReactNode } from 'react'

import { p as P } from '@/components/mdx'

type Style = {
  icon: LucideIcon
  label: string
  /** The alert's `-container` role, with its `on-…-container` text role: the pair MD3 guarantees the
   * contrast of, in light and dark, at every contrast level */
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

export function Gha({
  children,
  keyword,
  title,
}: {
  children: ReactNode
  keyword?: string
  title?: string
}) {
  if (!keyword || !(keyword in styles)) keyword = 'NOTE' // default to "NOTE"

  const { icon, label: defaultLabel, colors } = styles[keyword]
  const label = title ?? defaultLabel
  const Icon = icon

  // test if children is a string
  if (typeof children === 'string') {
    children = <P className="my-4">{children}</P>
  }

  return (
    <div
      data-slot="gha"
      data-keyword={keyword.toLowerCase()}
      // Links (footnote refs included) in the alert's text colour, still underlined: the site's
      // `primary` can all but vanish on an alert's container
      className={cn(
        'my-6 overflow-clip rounded-lg px-6 py-2 [&_a]:text-current [&_a_code]:text-current',
        colors,
      )}
    >
      <div className="my-4 flex items-center gap-2 text-lg font-semibold">
        <Icon size="1em" />
        {label}
      </div>
      {children}
    </div>
  )
}
