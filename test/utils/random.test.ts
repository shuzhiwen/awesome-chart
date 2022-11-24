import {uuid, isRawTable, randomTable, isRawTableList, randomTableList} from '../../src'

test('uuid', () => {
  expect(typeof uuid()).toBe('string')
  expect(uuid().length).toBe(16)
})

test('randomTable', () => {
  expect(
    isRawTable(
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
    isRawTable(
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
    isRawTableList(
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
    isRawTableList(
      randomTableList({
        mode: 'poisson',
        column: 10,
        row: 10,
        lambda: 100,
      })
    )
  ).toBe(true)
})
