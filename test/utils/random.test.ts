import {uuid, randomTable, randomTableList, isTable, isTableList} from '../../src'

test('uuid', () => {
  expect(typeof uuid()).toBe('string')
  expect(uuid().length).toBe(16)
})

test('randomTable', () => {
  expect(
    isTable(
      randomTable({
        mode: 'normal',
        column: 10,
        row: 10,
        mu: 100,
        sigma: 0,
      })
    )
  ).toBe(true)
  expect(
    isTable(
      randomTable({
        mode: 'poisson',
        column: 10,
        row: 10,
        lambda: 100,
      })
    )
  ).toBe(true)
})

test('randomTable', () => {
  expect(
    isTableList(
      randomTableList({
        mode: 'normal',
        column: 10,
        row: 10,
        mu: 100,
        sigma: 0,
      })
    )
  ).toBe(true)
  expect(
    isTableList(
      randomTableList({
        mode: 'poisson',
        column: 10,
        row: 10,
        lambda: 100,
      })
    )
  ).toBe(true)
})
