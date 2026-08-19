import { expect, test } from 'vitest'
import { wheelOf } from './browse.mouse'

test('reads which way the wheel turned, and where', () => {
  expect(wheelOf('[<64;12;3M')).toEqual({ direction: -1, column: 12 })
  expect(wheelOf('[<65;90;3M')).toEqual({ direction: 1, column: 90 })
})

test('a held modifier still turns the wheel', () => {
  // Shift adds 4, meta 8, ctrl 16
  expect(wheelOf('[<80;12;3M')).toEqual({ direction: -1, column: 12 })
  expect(wheelOf('[<81;12;3M')).toEqual({ direction: 1, column: 12 })
})

test('ignores what is not a wheel turn', () => {
  expect(wheelOf('j')).toBeUndefined()
  // A click, and its release
  expect(wheelOf('[<0;12;3M')).toBeUndefined()
  expect(wheelOf('[<0;12;3m')).toBeUndefined()
  // The sideways pair a trackpad also sends
  expect(wheelOf('[<66;12;3M')).toBeUndefined()
  expect(wheelOf('[<67;12;3M')).toBeUndefined()
})
