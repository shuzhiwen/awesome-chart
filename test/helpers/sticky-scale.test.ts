import {scaleBand} from 'd3'
import {stickyBandScale} from '../../src'

test('sticky-scale', () => {
  const scale = scaleBand<Meta>().domain(['d1', 'd2', 'd3']).range([0, 100]).paddingInner(0.5)

  expect(stickyBandScale(scale, 0)).toEqual({domain: 'd1', value: 10})
  expect(stickyBandScale(scale, 30)).toEqual({domain: 'd2', value: 50})
  expect(stickyBandScale(scale, 50)).toEqual({domain: 'd2', value: 50})
  expect(stickyBandScale(scale, 80)).toEqual({domain: 'd3', value: 90})
  expect(stickyBandScale(scale, 100)).toEqual({domain: 'd3', value: 90})
})
