import * as d3 from 'd3-shape'
import {Graphics, IPointData, Polygon} from 'pixi.js'
import {CurveDrawerProps} from '../types'
import {drawPath} from './path'

export function drawCurve({data = [], ...rest}: CurveDrawerProps) {
  return drawPath({
    ...rest,
    fillOpacity: 0,
    data: data.map(({points, curve}) => ({
      centerX: 0,
      centerY: 0,
      path: (context) => {
        const path = d3
          .line()
          .context(context || null)
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3[curve])(points.map(({x, y}) => [x, y]))!

        if (context instanceof Graphics) {
          context.hitArea = {
            contains: (x: number, y: number) => {
              const points = context.geometry.points
              const odd: IPointData[] = []
              const even: IPointData[] = []

              for (let index = 0; index * 2 < points.length; index++) {
                const x = points[index * 2]
                const y = points[index * 2 + 1]
                ;(index % 2 === 0 ? odd : even).push({x, y})
              }

              return new Polygon([...odd, ...even.reverse()]).contains(x, y)
            },
          }
        }

        return path
      },
    })),
  })
}
