import { expect, test } from 'vitest'
import { parseMouse } from './browse.mouse'

/** What Ink hands over: the sequence the terminal sent, minus its leading escape. */
const event = (button: number, column: number, row: number, final = 'M') =>
  `[<${button};${column};${row}${final}`

test('reads a left click, in coordinates counting from zero', () => {
  expect(parseMouse(event(0, 12, 7))).toEqual({ kind: 'click', column: 11, row: 6 })
})

test('reads the wheel, both ways', () => {
  expect(parseMouse(event(64, 1, 1))?.kind).toBe('wheel-up')
  expect(parseMouse(event(65, 1, 1))?.kind).toBe('wheel-down')
})

test('a click counts once: the release that ends it is not a second one', () => {
  expect(parseMouse(event(0, 12, 7, 'm'))).toBeUndefined()
})

test('a modifier held down changes nothing about the click', () => {
  // shift (4), meta (8) and ctrl (16) ride in the same number as the button
  expect(parseMouse(event(0 + 4 + 16, 12, 7))).toEqual({ kind: 'click', column: 11, row: 6 })
})

test('leaves alone what it has no answer for', () => {
  expect(parseMouse(event(2, 12, 7))).toBeUndefined() // right button
  expect(parseMouse(event(66, 12, 7))).toBeUndefined() // sideways wheel
  expect(parseMouse(event(32, 12, 7))).toBeUndefined() // a drag
  expect(parseMouse('j')).toBeUndefined()
  expect(parseMouse('[A')).toBeUndefined()
})

test('reads a column past the 223 an older encoding could report', () => {
  expect(parseMouse(event(0, 400, 300))).toEqual({ kind: 'click', column: 399, row: 299 })
})
