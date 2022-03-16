import * as d3 from 'd3'
import {CurveDrawerProps} from '../types'
import {drawPath} from './path'

export function drawCurve({data = [], ...rest}: CurveDrawerProps) {
  return drawPath({
    data: data.map(({points, curve}) => ({
      centerX: 0,
      centerY: 0,
      path: d3
        .line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3[curve])(points.map(({x, y}) => [x, y]))!,
    })),
    ...rest,
  })
}
