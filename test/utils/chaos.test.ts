import {select} from 'd3'
import {
  range,
  getAttr,
  addStyle,
  addEvent,
  mergeAlpha,
  transformAttr,
  getTextWidth,
  group,
  ungroup,
  getMagnitude,
  flatDrawerConfig,
  swap,
  errorCatcher,
  safeTransform,
} from '../../src'

test('group', () => {
  expect(group(1)).toEqual([1])
  expect(group({})).toEqual([{}])
  expect(group(null)).toEqual([])
  expect(group([1])).toEqual([1])
  expect(group([1, 2, [3]])).toEqual([1, 2, [3]])
})

test('ungroup', () => {
  expect(ungroup(1)).toEqual(1)
  expect(ungroup({})).toEqual({})
  expect(ungroup(null)).toEqual(null)
  expect(ungroup([[1]])).toEqual(1)
  expect(ungroup([1, 2, [3]])).toEqual(1)
  expect(ungroup([[1], 2, 3])).toEqual(1)
})

test('getTextWidth', () => {
  expect(typeof getTextWidth('abcdef')).toBe('number')
  expect(getTextWidth('abcdef')).toBeGreaterThan(0)
})

test('getMagnitude', () => {
  expect(getMagnitude(0.000000005, 1)).toEqual(0.000000001)
  expect(getMagnitude(0.5, 0.1)).toEqual(1)
  expect(getMagnitude(50, 0.1)).toEqual(100)
  expect(getMagnitude(-50, -0.1)).toEqual(100)
  expect(getMagnitude(-50, 0.1)).toEqual(100)
  expect(getMagnitude(500, 100)).toEqual(1)
  expect(getMagnitude(5000, 1)).toEqual(1000)
})

test('range', () => {
  expect(range(0, 4)).toEqual([0, 1, 2, 3, 4])
  expect(range(4, 0, -1)).toEqual([0, 1, 2, 3, 4].reverse())
  expect(range(-2, 2)).toEqual([-2, -1, 0, 1, 2])
  expect(range(0, 1, 0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
  expect(range(1, 0, -0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1].reverse())
  expect(range(-0.1, 0.1, 0.05)).toEqual([-0.1, -0.05, 0, 0.05, 0.1])
  expect(range(4, 0, 1)).toEqual([])
})

test('mergeAlpha', () => {
  expect(typeof mergeAlpha(0xffffff, 0.5)).toBe('string')
  expect(typeof mergeAlpha('#ffffff', 0.5)).toBe('string')
  expect(typeof mergeAlpha('rgb(255,255,0)', 0.5)).toBe('string')
  expect(typeof mergeAlpha('black', 0.5)).toBe('string')
  expect(mergeAlpha('#33445580', 0)).toBe('#33445500')
  expect(mergeAlpha('#33445580', 1)).toBe('#33445580')
  expect(mergeAlpha('color', 0.5)).toBe('color')
  expect(mergeAlpha(new Error('wrong'), 0.5)).toEqual(new Error('wrong'))
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

test('getAttr', () => {
  const attributes = ['123', 456, '789']

  expect(getAttr(123, 0, null)).toBe(123)
  expect(getAttr('123', 0, null)).toBe('123')
  expect(getAttr('123', 2, null)).toBe('123')
  expect(getAttr('123', -1, null)).toBe('123')
  expect(getAttr(false, -1, true)).toBe(false)
  expect(getAttr(undefined, -1, '456')).toBe('456')
  expect(getAttr(null, -1, '456')).toBe('456')
  expect(getAttr(attributes, 0, null)).toBe('123')
  expect(getAttr(attributes, 1, null)).toBe(456)
  expect(getAttr(attributes, 0, null)).toBe('123')
  expect(getAttr(attributes, -1, undefined)).toBe(undefined)
  expect(getAttr(attributes, -1, 666)).toBe(666)
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

test('safeTransform', () => {
  expect(safeTransform('', 'translateX', 1000, {unit: false, append: false})).toBe(
    'translateX(1000)'
  )
  expect(safeTransform('', 'translateX', 100, {unit: true, append: false})).toBe(
    'translateX(100px)'
  )
  expect(safeTransform('scale(0.2)', 'translateX', 100, {unit: true, append: false})).toBe(
    'scale(0.2)translateX(100px)'
  )
})

test('flatDrawerConfig', () => {
  const config = {
    fill: ['red', 'blue'],
    stroke: ['green'],
    strokeWidth: ['1px', '2px', '3px'],
  }
  expect(flatDrawerConfig(config, 0)).toEqual({
    fill: 'red',
    stroke: 'green',
    strokeWidth: '1px',
  })
  expect(flatDrawerConfig(config, 1)).toEqual({
    fill: 'blue',
    stroke: null,
    strokeWidth: '2px',
  })
  expect(flatDrawerConfig(config, 2)).toEqual({
    fill: null,
    stroke: null,
    strokeWidth: '3px',
  })
})

test('swap', () => {
  let a: any
  let b: any

  a = {key1: 'value1'}
  b = {key2: 'value2'}
  swap(a, b, 'key1', 'key2')
  expect(a).toEqual({key1: 'value2'})
  expect(b).toEqual({key2: 'value1'})

  a = [1, 2, 3]
  b = [4, 5, 6]
  swap(a, b, 0, 1)
  expect(a).toEqual([5, 2, 3])
  expect(b).toEqual([4, 1, 6])

  a = 1
  b = 2
  swap(a, b, 0)
  expect(a).toBe(1)
  expect(b).toBe(2)

  a = 1
  b = {key: 'value'}
  swap(a, b, 'key1')
  expect(a).toBe(1)
  expect(b).toEqual({key: 'value'})

  a = {key1: 'value1'}
  b = {key2: 'value2'}
  swap(a, b, 'key1')
  expect(a).toEqual({key1: undefined})
  expect(b).toEqual({key2: 'value2', key1: 'value1'})

  a = [1, 2, 3]
  b = [4, 5, 6]
  swap(a, b, 'key1', 'key2')
  expect(a).toEqual([1, 2, 3])
  expect(b).toEqual([4, 5, 6])
})

test('errorCatcher', () => {
  let message
  const normalFunction = () => true
  const errorFunction = () => {
    throw new Error('This is a message')
  }
  const onError = (error: Error) => {
    message = error.message
  }
  expect(errorCatcher(normalFunction, onError)()).toBe(true)
  errorCatcher(errorFunction, onError)()
  expect(message).toBe('This is a message')
})
