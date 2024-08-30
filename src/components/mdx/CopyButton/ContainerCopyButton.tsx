'use client'

import cn from '@/lib/cn'
import { type ReactNode } from 'react'

export const ContainerCopyButton = ({ children }: { children: ReactNode }) => {
  return <div className={cn('group/copy-button relative')}>{children}</div>
}
