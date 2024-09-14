'use client'

import cn from '@/lib/cn'
import { ComponentProps, ReactNode, useEffect, useState } from 'react'
import { TbClipboard, TbClipboardCheck } from 'react-icons/tb'

export const Code = ({ children, className, ...props }: ComponentProps<'pre'>) => {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const textToCopy = extractTextFromChildren(children)

    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return
    const int = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(int)
  }, [copied])

  return (
    <div className={cn('relative')}>
      <pre
        {...props}
        className={cn(
          className,
          'bg-inverse-surface-light my-5 overflow-auto rounded-lg p-[--pad] font-mono text-sm',
        )}
      >
        {children}
      </pre>
      <button
        className="absolute right-0 top-0 m-4 flex size-8 items-center justify-center rounded-md text-outline-variant transition-colors hover:text-outline"
        onClick={handleClick}
        aria-label="Copy to clipboard"
      >
        {copied ? <TbClipboardCheck className="size-6" /> : <TbClipboard className="size-6" />}
      </button>
    </div>
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

  if (typeof children === 'object' && children !== null && 'props' in children) {
    return extractTextFromChildren(children.props.children)
  }

  return ''
}
