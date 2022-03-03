import {tableListToObjects, tableListToTable, relationToTable} from '../../src/main'

test('tableListToObjects', () => {
  expect(
    tableListToObjects([
      ['d1', 'd2', 'd3', 123],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ])
  ).toStrictEqual([
    {
      d1: 1,
      d2: 2,
      d3: 3,
      123: 4,
    },
    {
      d1: 5,
      d2: 6,
      d3: 7,
      123: 8,
    },
  ])
  expect(() =>
    tableListToObjects([
      ['d1', 'd2', 'd3'],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ])
  ).toThrowError()
  expect(() => tableListToObjects([])).toThrowError()
})

test('tableListToTable', () => {
  expect(
    tableListToTable([
      ['row', 'column', 'value'],
      ['r1', 'c1', 123],
      ['r1', 'c2', 456],
      ['r2', 'c1', 789],
      ['r2', 'c2', 789],
      ['r3', 'c3', 100],
    ])
  ).toStrictEqual([
    ['r1', 'r2', 'r3'],
    ['c1', 'c2', 'c3'],
    [
      [123, 456, NaN],
      [789, 789, NaN],
      [NaN, NaN, 100],
    ],
  ])
  expect(() =>
    tableListToTable([
      ['d1', 'd2'],
      [1, 2],
      [5, 6],
    ])
  ).toThrowError()
  expect(() => tableListToTable([])).toThrowError()
})

test('relationToTable', () => {
  expect(
    relationToTable([
      [
        ['id', 'name'],
        [1, 'n1'],
        [2, 'n2'],
        [3, 'n3'],
        [4, 'n4'],
      ],
      [
        ['from', 'to', 'value'],
        [1, 1, '111'],
        [3, 1, '222'],
        [2, 4, '333'],
        [2, 2, '444'],
      ],
    ])
  ).toStrictEqual([
    ['n1', 'n2', 'n3', 'n4'],
    ['n1', 'n2', 'n3', 'n4'],
    [
      ['111', NaN, NaN, NaN],
      [NaN, '444', NaN, '333'],
      ['222', NaN, NaN, NaN],
      [NaN, NaN, NaN, NaN],
    ],
  ])
})
