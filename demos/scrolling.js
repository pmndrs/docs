export default `import './styles.css'
import { useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'

export default function Scrolling() {
  const [flip, set] = useState(false)

  const words = ['We', 'came.', 'We', 'saw.', 'We', 'kicked', 'its', 'ass.']

  const { scroll } = useSpring({
    scroll: (words.length - 1) * 50,
    from: { scroll: 0 },
    reset: true,
    reverse: flip,
    delay: 200,
    config: config.molasses,
    onRest: () => set(!flip),
  })

  return (
    <animated.div
      style={{
        position: 'relative',
        width: '100%',
        height: 60,
        overflow: 'auto',
        fontSize: '0.5em',
      }}
      scrollTop={scroll}
    >
      {words.map((word, i) => (
        <div style={{ width: '100%', height: 100, textAlign: 'center' }}>
          {word}
        </div>
      ))}
    </animated.div>
  )
}
`
