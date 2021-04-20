export default `import './styles.css'
import { useSpring, animated } from '@react-spring/web'

export default function ChainExample() {
  const styles = useSpring({
    loop: true,
    to: [
      { opacity: 1, color: '#ffaaee' },
      { opacity: 0, color: 'rgb(14,26,19)' },
    ],
    from: { opacity: 0, color: 'red' },
  })
  // ...
  return <animated.div style={styles}>I will fade in and out</animated.div>
}
`
