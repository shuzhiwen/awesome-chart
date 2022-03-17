import {formatNumber, overflowControl} from '../../src'

jest.mock('../../src/utils/chaos', () => ({
  __esModule: true,
  getTextWidth: jest.fn((text) => (text?.length > 5 ? 100 : 20)),
}))

test('formatNumber', () => {
  expect(formatNumber(1.00000000008)).toEqual('1')
  expect(formatNumber('1.00000000008')).toEqual('1')
  expect(formatNumber('1.00000000008abc')).toEqual('1.00000000008abc')
  // with config
  expect(
    formatNumber(1.23999999999, {
      percentage: false,
      thousandth: false,
      decimals: 2,
    })
  ).toEqual('1.24')
  expect(
    formatNumber(1.23999999999, {
      percentage: true,
      thousandth: false,
      decimals: 2,
    })
  ).toEqual('124%')
  expect(
    formatNumber(1111.23999999, {
      percentage: true,
      thousandth: true,
      decimals: 2,
    })
  ).toEqual('111,124%')
  expect(
    formatNumber(1111.1123999, {
      percentage: true,
      thousandth: true,
      decimals: 2,
    })
  ).toEqual('111,111.24%')
})

test('overflowControl', () => {
  const short = 'abc'
  const long = 'abcdefg'

  expect(overflowControl(short, {})).toBe(short)
  expect(overflowControl(long, {width: 50})).toBe('ab...')
  expect(overflowControl(long, {height: 5})).toBe(null)
  expect(overflowControl(long, {height: 5, fontSize: 3})).toBe(long)
  expect(overflowControl(long, {width: 50, omit: false})).toBe('abcde')
})
