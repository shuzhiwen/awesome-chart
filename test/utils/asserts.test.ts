import {isRawTable, isRawTableList, isRawRelation} from '../../src'

test('isRawTableList', () => {
  expect(
    isRawTableList([
      ['h1', 'h2', 'h3'],
      [101, 102, 103],
      [201, 202, 203],
      [301, 302, 303],
    ])
  ).toBe(true)
  expect(
    isRawTableList([
      ['h1', 'h2', 'h3'],
      [101, 102, 103],
      [201, 202, 203, 204],
      [301, 302, 303],
    ])
  ).toBe(false)
  expect(
    isRawTableList([
      ['h1', 'h2'],
      [101, 102, 103],
      [201, 202, 203],
      [301, 302, 303],
    ])
  ).toBe(false)
  expect(
    isRawTableList([
      ['h1', 'h2', 'h3'],
      [101, 102, 103],
      {
        0: 201,
        1: 202,
        2: 203,
      },
      [301, 302, 303],
    ])
  ).toBe(false)
  expect(isRawTableList([])).toBe(false)
  expect(isRawTableList(null)).toBe(false)
  // empty tableList
  expect(isRawTableList([[]])).toBe(true)
})

test('isRawTable', () => {
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      ['c1', 'c2', 'c3'],
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
      ],
    ])
  ).toBe(true)
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      ['c1', 'c2', 'c3'],
      ['p1', 'p2', 'p3'],
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
      ],
    ])
  ).toBe(false)
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
      ],
    ])
  ).toBe(false)
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      'column',
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
      ],
    ])
  ).toBe(false)
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      ['c1', 'c2', 'c3'],
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
        [401, 402, 403],
      ],
    ])
  ).toBe(false)
  expect(
    isRawTable([
      ['r1', 'r2', 'r3'],
      ['c1', 'c2', 'c3'],
      [
        [101, 102, 103, 104],
        [201, 202, 203, 204],
        [301, 302, 303, 304],
      ],
    ])
  ).toBe(false)
  expect(isRawTable([])).toBe(false)
  expect(isRawTable(null)).toBe(false)
  // empty table
  expect(isRawTable([['row'], [], [[]]])).toBe(true)
})

test('isRawRelation', () => {
  expect(
    isRawRelation([
      [
        ['id', 'name'],
        ['n1', 'node_1'],
        ['n2', 'node_2'],
        ['n3', 'node_3'],
      ],
      [
        ['id', 'from', 'to'],
        ['l1', 'n1', 'n2'],
        ['l2', 'n2', 'n3'],
        ['l3', 'n1', 'n3'],
      ],
    ])
  ).toBe(true)
  expect(isRawRelation([[], []])).toBe(false)
})
