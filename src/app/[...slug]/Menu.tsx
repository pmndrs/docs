'use client'

import { Nav } from '@/components/Nav'
import cn from '@/lib/cn'
import { ComponentProps, ElementRef, useEffect, useRef } from 'react'
import { useDocs } from './DocsContext'
import { useMenu } from './MenuContext'

export function Menu({ className, asPath }: ComponentProps<'dialog'> & { asPath: string }) {
  const { doc, docs } = useDocs()

  const [opened, setOpened] = useMenu()
  const dialogRef = useRef<ElementRef<'dialog'>>(null)

  useEffect(() => {
    if (opened) {
      dialogRef.current?.show()
    } else {
      dialogRef.current?.close()
    }
  }, [opened])

  return (
    <dialog ref={dialogRef} className={cn(className, 'bg-surface-dim/95 backdrop-blur-xl')}>
      <Nav docs={docs} asPath={asPath} collapsible={false} />
    </dialog>
  )
}
