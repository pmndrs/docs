import { revalidatePath, revalidateTag } from 'next/cache'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { PAGE_COUNT_TAG } from '@/app/page.count'
import { POST } from './route'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-11-06T14:42:00Z') })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

test('throws the dumps and the home page away at once, then ignores a recount for a minute', async () => {
  const first = POST()
  expect(first.status).toBe(200)
  expect(revalidateTag).toHaveBeenCalledWith(PAGE_COUNT_TAG, { expire: 0 })
  expect(revalidatePath).toHaveBeenCalledWith('/')

  vi.advanceTimersByTime(59_000)
  const second = POST()
  expect(second.status).toBe(429)
  expect(second.headers.get('Retry-After')).toBe('1')
  expect(revalidateTag).toHaveBeenCalledTimes(1)

  vi.advanceTimersByTime(1_000)
  expect(POST().status).toBe(200)
  expect(revalidateTag).toHaveBeenCalledTimes(2)
})
