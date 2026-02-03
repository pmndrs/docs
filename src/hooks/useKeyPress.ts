import * as React from 'react'

export function useKeyPress(code: string) {
  const [pressed, setPressed] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === code) setPressed(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === code) setPressed(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [code])

  return pressed
}
