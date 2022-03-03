import {Custom} from '../../src/main'

test('custom', () => {
  const custom = new Custom('123')

  expect(custom.data).toBe('123')
  custom.set('item', 100)
  expect(custom.get('item')).toBe(100)
  custom.set('item', null)
  expect(custom.get('item')).toBe(null)
})
