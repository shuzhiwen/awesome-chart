import {scaleOrdinal} from 'd3'
import {ScaleArcProps, ScaleArcRangeItem} from '../types'

export function scaleAngle({domain, range, nice = {}}: ScaleArcProps) {
  const {paddingInner = 0} = nice,
    distance = range[1] - range[0],
    padding = (distance * paddingInner) / domain[0].length,
    available = distance * (1 - paddingInner),
    arcRange = domain[1]
      .reduce<ScaleArcRangeItem[]>(
        (prev, cur, index) => {
          const startAngle = prev[index].endAngle + padding
          const endAngle = startAngle + available * (cur as number)
          return [...prev, {startAngle, endAngle, weight: cur}]
        },
        [{endAngle: -padding, startAngle: -Infinity, weight: 0}]
      )
      .slice(1)

  return scaleOrdinal<ScaleArcRangeItem>()
    .domain(domain[0] as string[])
    .range(arcRange)
}
