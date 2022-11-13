import {
  robustRange,
  getTextWidth,
  group,
  ungroup,
  getMagnitude,
  swap,
  errorCatcher,
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
  expect(robustRange(0, 4)).toEqual([0, 1, 2, 3, 4])
  expect(robustRange(4, 0, -1)).toEqual([0, 1, 2, 3, 4].reverse())
  expect(robustRange(-2, 2)).toEqual([-2, -1, 0, 1, 2])
  expect(robustRange(0, 1, 0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
  expect(robustRange(1, 0, -0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1].reverse())
  expect(robustRange(-0.1, 0.1, 0.05)).toEqual([-0.1, -0.05, 0, 0.05, 0.1])
  expect(robustRange(4, 0, 1)).toEqual([])
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
