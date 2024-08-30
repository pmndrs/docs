'use client'

import cn from '@/lib/cn'
import { useRef } from 'react'

type Nullable<T> = T | null | undefined

interface CopyButtonProps {
  copyIcon: string
  copiedIcon: string
  feedbackDuration: number
}

export const CopyButton = ({ copyIcon, copiedIcon, feedbackDuration }: CopyButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    const $button = buttonRef.current
    const $pre = $button?.nextElementSibling as Nullable<HTMLPreElement>
    const $code = $pre?.firstChild as Nullable<HTMLButtonElement>

    if (!$button || $button.classList.contains('active') || !$pre || !$code) return

    navigator.clipboard.writeText($code.innerText.replaceAll('\n\n', '\n'))
    $button.classList.add('active')
    setTimeout(() => void $button.classList.remove('active'), feedbackDuration)
  }

  return (
    <button
      ref={buttonRef}
      className={cn(
        // container button
        'group-hover/copy-button:opacity-100',
        // button
        'bg-inverse-surface-light absolute right-4 top-4 z-10 size-10 cursor-pointer rounded',
        'border border-white/25 bg-[length:20px] bg-center bg-no-repeat opacity-0',
        'bg-[image:--copy-icon] [&:not(.active):hover]:bg-surface-variant-dark focus:opacity-100',
        // button.active
        '[&.active]:rounded-l-none [&.active]:bg-[image:--copied-icon]',
        // button.active:before
        '[&.active:before]:bg-inverse-surface-light [&.active:before]:relative',
        '[&.active:before]:-top-px [&.active:before]:flex [&.active:before]:h-10',
        '[&.active:before]:w-fit [&.active:before]:translate-x-[calc(-100%-1px)]',
        '[&.active:before]:items-center [&.active:before]:justify-center',
        '[&.active:before]:whitespace-nowrap [&.active:before]:rounded-l [&.active:before]:border',
        '[&.active:before]:border-r-0 [&.active:before]:border-white/25 [&.active:before]:px-2.5',
        '[&.active:before]:text-center [&.active:before]:text-xs [&.active:before]:font-medium',
        '[&.active:before]:text-[#808080] [&.active:before]:content-["Copied"]',
      )}
      style={
        { '--copy-icon': `url("${copyIcon}")`, '--copied-icon': `url("${copiedIcon}")` } as never
      }
      type="button"
      onClick={handleClick}
      dir="ltr"
    />
  )
}
