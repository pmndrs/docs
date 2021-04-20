export default `import './styles.css'
import { PureComponent } from 'react'
import { Transition, config, animated } from 'react-spring'

export default class Toggle extends PureComponent {
  constructor() {
    super()

    this.state = {
      toggle: false,
    }
  }

  render() {
    const { toggle } = this.state
    return (
      <Transition
        items={toggle}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
        reverse={toggle}
        delay={200}
        config={config.molasses}
        onRest={() =>
          this.setState({
            toggle: !toggle,
          })
        }
      >
        {({ opacity }, item) =>
          item ? (
            <animated.div
              style={{
                position: 'absolute',
                opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
              }}
            >
              😄
            </animated.div>
          ) : (
            <animated.div
              style={{
                position: 'absolute',
                opacity: opacity.to({ range: [1.0, 0.0], output: [0, 1] }),
              }}
            >
              🤪
            </animated.div>
          )
        }
      </Transition>
    )
  }
}
`
