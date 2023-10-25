import * as d3 from 'd3-shape'
import {AreaDrawerProps} from '../types'
import {drawPath} from './path'

export function drawArea({data = [], ...rest}: AreaDrawerProps) {
  return drawPath({
    data: data.map(({lines, curve}) => ({
      path: d3
        .area()
        .y0((d) => d[1])
        .y1((d) => d[0])
        .x((_, i) => lines[i].x)
        .curve(d3[curve])(lines.map(({y1, y2}) => [y1, y2]))!,
    })),
    ...rest,
  })
}
