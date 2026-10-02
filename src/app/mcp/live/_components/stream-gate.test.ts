import { describe, expect, it, vi } from 'vitest'
import { watchStreamGate, type GateEnvironment } from './stream-gate'
import { resumeUrl } from './use-mcp-events'

/** A document and an IntersectionObserver the test drives by hand. */
function fakeEnvironment(visibility: DocumentVisibilityState = 'visible') {
  const listeners = new Set<() => void>()
  let intersect: (isIntersecting: boolean) => void = () => {}
  const observer = { observe: vi.fn(), disconnect: vi.fn() }

  const document = {
    visibilityState: visibility,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }
  const environment = {
    document,
    IntersectionObserver: class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = (isIntersecting) => callback([{ isIntersecting }])
      }
      observe = observer.observe
      disconnect = observer.disconnect
    },
  } as unknown as GateEnvironment

  return {
    environment,
    observer,
    listeners,
    intersect: (isIntersecting: boolean) => intersect(isIntersecting),
    setVisibility(state: DocumentVisibilityState) {
      document.visibilityState = state
      listeners.forEach((listener) => listener())
    },
  }
}

describe('watchStreamGate', () => {
  it('opens only while in view and visible', () => {
    const fake = fakeEnvironment()
    const onChange = vi.fn()
    watchStreamGate({} as Element, onChange, { closeDelayMs: 0, environment: fake.environment })

    expect(onChange).toHaveBeenLastCalledWith(false) // not known to be in view yet
    fake.intersect(true)
    expect(onChange).toHaveBeenLastCalledWith(true)

    fake.setVisibility('hidden')
    expect(onChange).toHaveBeenLastCalledWith(false)
    fake.setVisibility('visible')
    expect(onChange).toHaveBeenLastCalledWith(true)

    fake.intersect(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('stays closed in a hidden tab, even in view', () => {
    const fake = fakeEnvironment('hidden')
    const onChange = vi.fn()
    watchStreamGate({} as Element, onChange, { closeDelayMs: 0, environment: fake.environment })

    fake.intersect(true)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('reports changes only', () => {
    const fake = fakeEnvironment()
    const onChange = vi.fn()
    watchStreamGate({} as Element, onChange, { closeDelayMs: 0, environment: fake.environment })

    fake.intersect(true)
    fake.intersect(true)
    fake.setVisibility('visible')
    expect(onChange.mock.calls).toEqual([[false], [true]])
  })

  it('counts the element as in view where IntersectionObserver is missing', () => {
    const fake = fakeEnvironment()
    const onChange = vi.fn()
    watchStreamGate({} as Element, onChange, {
      environment: { document: fake.environment.document },
    })

    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('closes only once out of view for `closeDelayMs`', () => {
    vi.useFakeTimers()
    const fake = fakeEnvironment()
    const onChange = vi.fn()
    watchStreamGate({} as Element, onChange, { closeDelayMs: 1_000, environment: fake.environment })
    fake.intersect(true)

    // Scrolled past and back: the stream stays open
    fake.intersect(false)
    vi.advanceTimersByTime(900)
    fake.intersect(true)
    vi.advanceTimersByTime(1_000)
    expect(onChange.mock.calls).toEqual([[false], [true]])

    // Hidden for good: it closes, once the delay is over
    fake.setVisibility('hidden')
    vi.advanceTimersByTime(999)
    expect(onChange).toHaveBeenLastCalledWith(true)
    vi.advanceTimersByTime(1)
    expect(onChange).toHaveBeenLastCalledWith(false)
    vi.useRealTimers()
  })

  it('stops watching', () => {
    const fake = fakeEnvironment()
    const onChange = vi.fn()
    const stop = watchStreamGate({} as Element, onChange, {
      closeDelayMs: 0,
      environment: fake.environment,
    })

    stop()
    expect(fake.observer.disconnect).toHaveBeenCalled()
    expect(fake.listeners.size).toBe(0)
  })
})

describe('resumeUrl', () => {
  it('asks to resume after the last event seen', () => {
    expect(resumeUrl('/api/mcp-events', undefined)).toBe('/api/mcp-events')
    expect(resumeUrl('/api/mcp-events', '0abc-0001')).toBe('/api/mcp-events?lastEventId=0abc-0001')
    expect(resumeUrl('https://docs.pmnd.rs/api/mcp-events?lib=drei', 'x y')).toBe(
      'https://docs.pmnd.rs/api/mcp-events?lib=drei&lastEventId=x%20y',
    )
  })
})
