import { describe, expect, it, vi } from 'vitest'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import { createEventId, createMemoryEventBus, type McpEventBus } from './bus'
import { createEventStream } from './sse'

function event(lib: string): McpEvent {
  const ts = Date.now()
  return {
    id: createEventId(ts),
    ts,
    client: 'test',
    kind: 'tool',
    name: 'get_page_content',
    lib,
    durationMs: 1,
    ok: true,
  }
}

async function read(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const { value } = await reader.read()
  return new TextDecoder().decode(value)
}

/** Reads until `count` SSE messages (blocks separated by a blank line) have come in. */
async function readMessages(reader: ReadableStreamDefaultReader<Uint8Array>, count: number) {
  let text = ''
  while (text.split('\n\n').length - 1 < count) text += await read(reader)
  return text.split('\n\n').filter(Boolean)
}

describe('createEventStream', () => {
  it('sends the backlog, then live events', async () => {
    const bus = createMemoryEventBus()
    bus.publish(event('drei'))
    bus.publish(event('zustand'))

    const controller = new AbortController()
    const reader = createEventStream({ bus, signal: controller.signal }).getReader()

    const [retry, backlog] = await readMessages(reader, 2)
    expect(retry).toBe('retry: 3000')
    expect(backlog).toContain('event: backlog')
    const data = JSON.parse(backlog.split('data: ')[1]) as McpEvent[]
    expect(data.map(({ lib }) => lib)).toEqual(['drei', 'zustand'])

    const live = event('uikit')
    bus.publish(live)

    const [message] = await readMessages(reader, 1)
    expect(message).toBe(`id: ${live.id}\nevent: mcp\ndata: ${JSON.stringify(live)}`)

    controller.abort()
  })

  it('resumes after Last-Event-ID', async () => {
    const bus = createMemoryEventBus()
    const seen = event('drei')
    bus.publish(seen)
    const missed = event('drei')
    bus.publish(missed)

    const controller = new AbortController()
    const reader = createEventStream({
      bus,
      lastEventId: seen.id,
      signal: controller.signal,
    }).getReader()

    const [, backlog] = await readMessages(reader, 2)
    expect(JSON.parse(backlog.split('data: ')[1])).toEqual([missed])
    controller.abort()
  })

  it('sends a heartbeat', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const reader = createEventStream({
      bus: createMemoryEventBus(),
      signal: controller.signal,
      heartbeatMs: 1_000,
    }).getReader()

    await readMessages(reader, 2)
    vi.advanceTimersByTime(1_000)
    expect(await readMessages(reader, 1)).toEqual([': heartbeat'])

    controller.abort()
    vi.useRealTimers()
  })

  it('unsubscribes and closes when the request is aborted', async () => {
    const unsubscribe = vi.fn()
    const bus: McpEventBus = {
      publish: vi.fn(),
      recent: () => [],
      subscribe: vi.fn(() => unsubscribe),
    }

    const controller = new AbortController()
    const reader = createEventStream({ bus, signal: controller.signal }).getReader()
    await readMessages(reader, 2)

    controller.abort()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect((await reader.read()).done).toBe(true)
  })
})
