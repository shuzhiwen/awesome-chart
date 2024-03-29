import {EventManager} from '../../src'

test('EventManager', () => {
  const event = new EventManager<
    'addOne' | 'addTwo' | 'AddOneOnce' | 'MinusOnce'
  >()
  let value = 0

  event.on('addOne', '', () => value++)
  event.on('addOne', 'group1', () => value++)
  event.on('addOne', 'group2', () => value++)
  event.on('addTwo', '', () => (value += 2))
  event.once('AddOneOnce', '', () => value++)

  expect(event.has('addOne')).toBe(true)
  event.fire('addOne')
  event.fire('addOne')
  expect(value).toBe(6)
  event.fire('addTwo')
  event.fire('addTwo')
  expect(value).toBe(10)
  event.fire('AddOneOnce')
  event.fire('AddOneOnce')
  event.fire('AddOneOnce')
  expect(value).toBe(11)
  event.off('addOne', 'group1')
  expect(event.has('addOne')).toBe(true)
  event.fire('addOne')
  expect(value).toBe(13)
  event.off('addOne')
  expect(event.has('addOne')).toBe(false)
  event.fire('addOne')
  expect(value).toBe(13)

  value = 10
  expect(event.has('addOne')).toBe(false)
  event.onWithOff('MinusOnce', '', () => value--)
  event.fire('MinusOnce')
  expect(value).toBe(9)
  event.onWithOff('MinusOnce', '', () => value--)
  event.fire('MinusOnce')
  expect(value).toBe(8)
  event.onWithOff('MinusOnce', '', () => value--)
  event.fire('MinusOnce')
  expect(value).toBe(7)
  expect(event.has('MinusOnce')).toBe(true)
})
