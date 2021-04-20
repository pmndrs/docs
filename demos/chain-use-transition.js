export default `import './styles.css'
import {useState, useEffect} from 'react'
import { useTransition, animated, config } from '@react-spring/web'

export default function TransitionArray() {
  const [items, setItems] = useState(NUM_TRANS)

  const transitions = useTransition(items, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    delay: 200,
    config: config.molasses,
    onRest: () => setItems([]),
  })

  useEffect(() => {
    if (items.length === 0) {
      setTimeout(() => {
        setItems(NUM_TRANS)
      }, 2000)
    }
  }, [items])

  return (
    <div style={{ display: 'flex' }}>
      {transitions(({ opacity }, item) => (
        <animated.div
          style={{
            opacity: opacity.to(item.op),
            transform: opacity.to(item.trans).to((y) => ` +
  '`translate3d(0,${y}px,0)`' +
  `),
          }}
        >
          {item.fig}
        </animated.div>
      ))}
    </div>
  )
}
const NUM_TRANS = [
  {
    fig: 1,
    op: { range: [0.75, 1.0], output: [0, 1] },
    trans: { range: [0.75, 1.0], output: [-40, 0], extrapolate: 'clamp' },
  },
  {
    fig: 2,
    op: { range: [0.25, 0.5], output: [0, 1] },
    trans: { range: [0.25, 0.5], output: [-40, 0], extrapolate: 'clamp' },
  },
  {
    fig: 3,
    op: { range: [0.0, 0.25], output: [0, 1] },
    trans: { range: [0.0, 0.25], output: [-40, 0], extrapolate: 'clamp' },
  },
  {
    fig: 4,
    op: { range: [0.5, 0.75], output: [0, 1] },
    trans: { range: [0.5, 0.75], output: [-40, 0], extrapolate: 'clamp' },
  },
]
`
