import * as React from 'react'
import { CiDark, CiLight } from 'react-icons/ci'

const ToggleTheme = () => {
  const [isDark, setIsDark] = React.useState<boolean>()
  React.useEffect(() => {
    setIsDark(localStorage.getItem('theme') === 'dark')
  }, [])
  return (
    <button
      className="h-9 w-9 flex items-center justify-center"
      onClick={() => {
        // const isDark = localStorage.getItem('theme') === 'dark'
        localStorage.setItem('theme', isDark ? 'light' : 'dark')
        setIsDark(!isDark)
        document.documentElement.classList.toggle('dark')
      }}
    >
      {isDark ? <CiLight size="21" /> : <CiDark size="21" />}
    </button>
  )
}

export default ToggleTheme
