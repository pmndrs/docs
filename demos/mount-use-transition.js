export default `import './styles.css'
import {useState} from 'react'
import { useTransition, animated, config } from '@react-spring/web'

export default function Mount() {
  const [show, set] = useState(false)
  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    reverse: show,
    delay: 200,
    config: config.molasses,
    onRest: () => set(!show),
  })
  return transitions((styles, item) => item && <animated.div style={styles}>✌️</animated.div>)
}
`
