import * as d3 from 'd3-shape'
import {CurveDrawerProps} from '../types'
import {drawPath} from './path'

export function drawCurve({data = [], ...rest}: CurveDrawerProps) {
  return drawPath({
    data: data.map(({points, curve}) => ({
      centerX: 0,
      centerY: 0,
      path: (context) =>
        d3
          .line()
          .context(context || null)
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3[curve])(points.map(({x, y}) => [x, y]))!,
    })),
    ...rest,
    fillOpacity: 0,
  })
}
