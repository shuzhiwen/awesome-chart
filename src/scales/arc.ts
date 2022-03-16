import {scaleOrdinal} from 'd3'
import {ScaleArcProps} from '../types'

export function scaleArc({domain, range, nice}: ScaleArcProps) {
  const {paddingInner = 0} = nice,
    distance = range[1] - range[0],
    padding = (distance * paddingInner) / domain.data[0].list.length,
    available = distance * (1 - paddingInner),
    arcRange = domain.data[1].list
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
    .domain(domain.data[0].list as string[])
    .range(arcRange)
}
