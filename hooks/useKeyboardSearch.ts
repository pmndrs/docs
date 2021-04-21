import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export default function useKeyboardSearch({
  search,
  results,
  input,
}): [(e: any) => void, boolean, any, number, any] {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [active, setActive] = useState(0)
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (active + 1 < results.length) {
            setActive(active + 1)
          }
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (active - 1 >= 0) {
            setActive(active - 1)
          }
          break
        }
        case 'Enter': {
          router.push(results[active].url)
          setShow(false)
          break
        }
      }
    },
    [active, results, router]
  )

  useEffect(() => {
    setActive(0)
  }, [search])

  useEffect(() => {
    const inputs = ['input', 'select', 'button', 'textarea']

    const down = (e) => {
      if (
        document.activeElement &&
        // @ts-ignore
        inputs.indexOf(document.activeElement.tagName.toLowerCase() !== -1)
      ) {
        if (e.key === '/') {
          e.preventDefault()
          input.current.focus()
        } else if (e.key === 'Escape') {
          setShow(false)
        }
      }
    }

    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  return [handleKeyDown, show, setShow, active, setActive]
}
