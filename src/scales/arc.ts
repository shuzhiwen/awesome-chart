import {scaleOrdinal} from 'd3'
import {ScaleArcProps, ScaleArcRangeItem} from '../types'

export function scaleAngle({domain, range, nice = {}}: ScaleArcProps) {
  const {paddingInner = 0} = nice,
    length = domain[0].length,
    distance = range[1] - range[0],
    padding = length > 1 ? (distance * paddingInner) / length : 10e-5,
    available = distance - padding,
    arcRange = domain[1]
      .reduce<ScaleArcRangeItem[]>(
        (prev, cur, index) => {
          const startAngle = prev[index].endAngle + padding
          const endAngle = startAngle + available * Number(cur)
          return [...prev, {startAngle, endAngle, weight: cur}]
        },
        [{endAngle: -padding, startAngle: -Infinity, weight: 0}]
      )
      .slice(1)

  return scaleOrdinal<ScaleArcRangeItem>()
    .domain(domain[0] as string[])
    .range(arcRange)
}
