export default `import './styles.css'
import { PureComponent } from 'react'
import { Transition, config, animated } from 'react-spring'

export default class Mount extends PureComponent {
  constructor() {
    super()

    this.state = {
      show: false,
    }
  }

  render() {
    const { show } = this.state

    return (
      <Transition
        items={show}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
        reverse={show}
        delay={200}
        config={config.molasses}
        onRest={() =>
          this.setState({
            show: !show,
          })
        }
      >
        {(styles, item) => item && <animated.div style={styles}>✌️</animated.div>}
      </Transition>
    )
  }
}
`
