export default `import './styles.css'
import {useEffect} from 'react'
import { useSpring, animated } from '@react-spring/web'

export default function BackwardsCompatability() {
  const [styles, api] = useSpring(() => ({
    from: { x: -50, opacity: 1 },
  }))

  useEffect(() => {
    api({
      x: 50,
      opacity: 1,
      loop: { reverse: true },
    })
  }, [])

  return (
    <animated.div
      style={{
        width: 80,
        height: 80,
        backgroundColor: '#46e891',
        borderRadius: 16,
        ...styles,
      }}
    />
  )
}
`
