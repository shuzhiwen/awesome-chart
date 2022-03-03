import {isTable, isTableList, isRelation} from '../../src/main'

test('isTableList', () => {
  expect(
    isTableList([
      ['h1', 'h2', 'h3'],
      [101, 102, 103],
      [201, 202, 203],
      [301, 302, 303],
    ])
  ).toBe(true)
  expect(
    isTableList([
      ['h1', 'h2', 'h3'],
      [101, 102, 103],
      [201, 202, 203, 204],
      [301, 302, 303],
    ])
  ).toBe(false)
  expect(
    isTableList([
      ['h1', 'h2'],
      [101, 102, 103],
      [201, 202, 203],
      [301, 302, 303],
    ])
  ).toBe(false)
  expect(
    isTableList([
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
  expect(isTableList([])).toBe(false)
  expect(isTableList(null)).toBe(false)
  // empty tableList
  expect(isTableList([[]])).toBe(true)
})

test('isTable', () => {
  expect(
    isTable([
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
    isTable([
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
    isTable([
      ['r1', 'r2', 'r3'],
      [
        [101, 102, 103],
        [201, 202, 203],
        [301, 302, 303],
      ],
    ])
  ).toBe(false)
  expect(
    isTable([
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
    isTable([
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
    isTable([
      ['r1', 'r2', 'r3'],
      ['c1', 'c2', 'c3'],
      [
        [101, 102, 103, 104],
        [201, 202, 203, 204],
        [301, 302, 303, 304],
      ],
    ])
  ).toBe(false)
  expect(isTable([])).toBe(false)
  expect(isTable(null)).toBe(false)
  // empty table
  expect(isTable([['row'], [], [[]]])).toBe(true)
})

test('isRelation', () => {
  expect(
    isRelation([
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
  expect(isRelation([[], []])).toBe(false)
})
