export default `import './styles.css'
import { useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'

export default function SVG() {
  const [flip, set] = useState(false)
  const { x } = useSpring({
    reset: true,
    reverse: flip,
    from: { x: 0 },
    x: 1,
    delay: 200,
    config: config.molasses,
    onRest: () => set(!flip),
  })

  return (
    <animated.svg
      style={{ margin: 20, width: 80, height: 80 }}
      viewBox="0 0 45 44"
      strokeWidth="2"
      fill="white"
      stroke="rgb(45, 55, 71)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={156}
      strokeDashoffset={x.to((x) => (1 - x) * 156)}
    >
      <polygon points={POINTS} />
    </animated.svg>
  )
}

const POINTS ='22.5 35.25 8.68704657 42.5118994 11.3250859 27.1309497 0.150171867 16.2381006 15.5935233 13.9940503 22.5 0 29.4064767 13.9940503 44.8498281 16.2381006 33.6749141 27.1309497 36.3129534 42.5118994'
`
