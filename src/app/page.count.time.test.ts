import { expect, test } from 'vitest'
import { refreshTimes } from './page.count.time'

const utc = { locale: 'en-GB', timeZone: 'UTC' }

test('says when the count was made, and the hour after which it is made again', () => {
  expect(
    refreshTimes(new Date('2026-11-06T14:42:00Z'), new Date('2026-11-06T15:00:00Z'), utc),
  ).toEqual({ updated: '14:42', next: '15:42' })
})

test('gives the day too of a time that is not today', () => {
  // A count left from yesterday, its hour not gone yet
  expect(
    refreshTimes(new Date('2026-11-05T23:30:00Z'), new Date('2026-11-05T23:50:00Z'), utc),
  ).toEqual({ updated: '23:30', next: '6 Nov, 00:30' })
})

test('has no next time once it has gone: the count is due', () => {
  // Nobody came by for a day, the page still shows that count
  expect(
    refreshTimes(new Date('2026-11-05T14:42:00Z'), new Date('2026-11-06T09:00:00Z'), utc),
  ).toEqual({ updated: '5 Nov, 14:42', next: undefined })
})

test("reads the time on the viewer's clock", () => {
  const paris = { locale: 'en-GB', timeZone: 'Europe/Paris' }
  expect(
    refreshTimes(new Date('2026-11-06T14:42:00Z'), new Date('2026-11-06T15:00:00Z'), paris),
  ).toEqual({ updated: '15:42', next: '16:42' })
})
