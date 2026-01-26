import cn from '@/lib/cn'
import { ComponentProps, ReactNode } from 'react'
import { BiCommentError } from 'react-icons/bi'
import { CgInfo } from 'react-icons/cg'
import { HiOutlineLightBulb } from 'react-icons/hi2'
import { PiSealWarning, PiWarning } from 'react-icons/pi'

// Inline p component to avoid importing from main index
const P = (props: ComponentProps<'p'>) => <p className="my-4" {...props} />

type Style = {
  icon: React.ComponentType
  label: string
  bg: string
}

const styles: Record<string, Style> = {
  NOTE: {
    icon: CgInfo,
    label: 'Note',
    bg: 'bg-note-container',
  },
  TIP: {
    icon: HiOutlineLightBulb,
    label: 'Tip',
    bg: 'bg-tip-container',
  },
  IMPORTANT: {
    icon: BiCommentError,
    label: 'Important',
    bg: 'bg-important-container',
  },
  WARNING: {
    icon: PiWarning,
    label: 'Warning',
    bg: 'bg-warning-container',
  },
  CAUTION: {
    icon: PiSealWarning,
    label: 'Caution',
    bg: 'bg-caution-container',
  },
}

export function Gha({ children, keyword }: { children: ReactNode; keyword?: string }) {
  if (!keyword || !(keyword in styles)) keyword = 'NOTE' // default to "NOTE"

  const { icon, label, bg } = styles[keyword]
  const Icon = icon

  // test if children is a string
  if (typeof children === 'string') {
    children = <P className="my-4">{children}</P>
  }

  return (
    <div className={cn('my-6 overflow-clip rounded-lg px-6 py-2', bg)}>
      <div className="my-4 flex items-center gap-2 text-lg font-semibold">
        <Icon />
        {label}
      </div>
      {children}
    </div>
  )
}
