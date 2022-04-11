import {scaleOrdinal} from 'd3'
import {ScaleArcProps, ScaleArcRangeItem} from '../types'

export function scaleAngle({domain, range, nice = {}}: ScaleArcProps) {
  const {paddingInner = 0} = nice,
    distance = range[1] - range[0],
    padding = (distance * paddingInner) / domain.headers.length,
    available = distance * (1 - paddingInner),
    arcRange = domain.lists[1]
      .reduce<ScaleArcRangeItem[]>(
        (prev, cur, index) => {
          const startAngle = prev[index].endAngle + padding
          const endAngle = startAngle + available * (cur as number)
          return [...prev, {startAngle, endAngle}]
        },
        [{endAngle: -padding, startAngle: -Infinity}]
      )
      .slice(1)

  return scaleOrdinal<ScaleArcRangeItem>()
    .domain(domain.lists[0] as string[])
    .range(arcRange)
}
