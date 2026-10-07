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
  bg: string
}

const styles: Record<string, Style> = {
  NOTE: {
    icon: InfoIcon,
    label: 'Note',
    bg: 'bg-note-container',
  },
  TIP: {
    icon: LightbulbIcon,
    label: 'Tip',
    bg: 'bg-tip-container',
  },
  IMPORTANT: {
    icon: MessageSquareWarningIcon,
    label: 'Important',
    bg: 'bg-important-container',
  },
  WARNING: {
    icon: TriangleAlertIcon,
    label: 'Warning',
    bg: 'bg-warning-container',
  },
  CAUTION: {
    icon: OctagonAlertIcon,
    label: 'Caution',
    bg: 'bg-caution-container',
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

  const { icon, label: defaultLabel, bg } = styles[keyword]
  const label = title ?? defaultLabel
  const Icon = icon

  // test if children is a string
  if (typeof children === 'string') {
    children = <P className="my-4">{children}</P>
  }

  return (
    <div className={cn('my-6 overflow-clip rounded-lg px-6 py-2', bg)}>
      <div className="my-4 flex items-center gap-2 text-lg font-semibold">
        <Icon size="1em" />
        {label}
      </div>
      {children}
    </div>
  )
}
