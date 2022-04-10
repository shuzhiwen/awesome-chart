import {scaleOrdinal} from 'd3'
import {ScaleArcProps} from '../types'

export function scaleArc({domain, range, nice = {}}: ScaleArcProps) {
  const {paddingInner = 0} = nice,
    distance = range[1] - range[0],
    padding = (distance * paddingInner) / domain.headers.length,
    available = distance * (1 - paddingInner),
    arcRange = domain.lists[0]
      .reduce(
        (prev, cur, index) => {
          const startAngle = prev[index].endAngle + padding
          const endAngle = startAngle + available * (cur as number)
          return [...prev, {startAngle, endAngle}]
        },
        [{endAngle: -padding}]
      )
      .slice(1)

  return scaleOrdinal()
    .domain(domain.headers as string[])
    .range(arcRange)
}
