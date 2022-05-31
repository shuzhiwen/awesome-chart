import {select} from 'd3'
import {
  range,
  getAttr,
  addStyle,
  addEvent,
  mergeAlpha,
  transformAttr,
  getTextWidth,
} from '../../src'

test('range', () => {
  // integer
  expect(range(0, 4)).toEqual([0, 1, 2, 3, 4])
  expect(range(4, 0, -1)).toEqual([0, 1, 2, 3, 4].reverse())
  expect(range(-2, 2)).toEqual([-2, -1, 0, 1, 2])
  // float
  expect(range(0, 1, 0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
  expect(range(1, 0, -0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1].reverse())
  expect(range(-0.1, 0.1, 0.05)).toEqual([-0.1, -0.05, 0, 0.05, 0.1])
  // invalid
  expect(range(4, 0, 1)).toEqual([])
})

test('mergeAlpha', () => {
  // valid
  expect(typeof mergeAlpha(0xffffff, 0.5)).toBe('string')
  expect(typeof mergeAlpha('#ffffff', 0.5)).toBe('string')
  expect(typeof mergeAlpha('rgb(255,255,0)', 0.5)).toBe('string')
  expect(typeof mergeAlpha('black', 0.5)).toBe('string')
  expect(mergeAlpha('#33445580', 0)).toBe('#33445500')
  expect(mergeAlpha('#33445580', 1)).toBe('#33445580')
  // invalid
  expect(mergeAlpha('color', 0.5)).toBe('color')
  expect(mergeAlpha(new Error('wrong'), 0.5)).toEqual(new Error('wrong'))
})

test('getAttr', () => {
  const attributes = ['123', 456, '789']
  // single
  expect(getAttr(123, 0, null)).toBe(123)
  expect(getAttr('123', 0, null)).toBe('123')
  expect(getAttr('123', 2, null)).toBe('123')
  expect(getAttr('123', -1, null)).toBe('123')
  expect(getAttr(false, -1, true)).toBe(false)
  expect(getAttr(undefined, -1, '456')).toBe('456')
  expect(getAttr(null, -1, '456')).toBe('456')
  // group
  expect(getAttr(attributes, 0, null)).toBe('123')
  expect(getAttr(attributes, 1, null)).toBe(456)
  // group require index
  expect(getAttr(attributes, 0, null)).toBe('123')
  expect(getAttr(attributes, -1, undefined)).toBe(undefined)
  expect(getAttr(attributes, -1, 666)).toBe(666)
})

test('addStyle', () => {
  const selection = select(document.createElement('svg'))
  expect(addStyle(selection, {}))
  expect(addStyle(selection, {color: 'red'}))
  expect(addStyle(selection, {color: ['red', 'yellow']}, 1))
})

test('addEvent', () => {
  const selection = select(document.createElement('svg'))
  expect(addEvent(selection, {}))
  expect(addEvent(selection, {click: jest.fn()}))
  expect(addEvent(selection, {click: jest.fn()}, null))
})

test('transformAttr', () => {
  expect(transformAttr({})).toEqual({})
  expect(
    transformAttr({
      color: 'red',
      backgroundColor: 'rgb(0,0,0)',
      fontSize: '12px',
      abcDEF: null,
    })
  ).toEqual({
    color: 'red',
    'background-color': 'rgb(0,0,0)',
    'font-size': '12px',
    'abc-def': null,
  })
})

test('getTextWidth', () => {
  expect(typeof getTextWidth('abcdef')).toBe('number')
  expect(getTextWidth('abcdef')).toBeGreaterThan(0)
})
