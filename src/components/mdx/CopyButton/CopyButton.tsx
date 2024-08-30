'use client'

import { useCallback, useRef } from 'react'

export const CopyButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(() => {
    const $button = buttonRef.current
    const $pre = $button?.nextElementSibling as HTMLPreElement | null
    const $code = $pre?.firstChild as HTMLButtonElement | null

    if (!$button || $button.classList.contains('copied') || !$pre || !$code) return

    navigator.clipboard.writeText($code.innerText.replaceAll('\n\n', '\n'))
    $button.classList.add('copied')
    setTimeout(() => void $button.classList.remove('copied'), 3000)
  }, [])

  return <button className="copy" ref={buttonRef} type="button" onClick={handleClick} />
}
