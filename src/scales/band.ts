import {isNumber} from 'lodash'
import {ScaleBandProps} from '../types'
import {scaleBand as d3ScaleBand} from 'd3-scale'

export function scaleBand(this: any, {domain, range, nice = {}}: ScaleBandProps) {
  const {fixedBandwidth, fixedPaddingInner, fixedBoundary, paddingInner} = nice,
    scale = d3ScaleBand<Meta>().domain(domain).range(range),
    distance = Math.abs(range[1] - range[0])

  if (isNumber(fixedBandwidth) && isNumber(fixedPaddingInner)) {
    const fixedRange = fixedBandwidth * domain.length + fixedPaddingInner * (domain.length - 1),
      offset = (fixedRange - distance) * Math.sign(range[1] - range[0])
    scale.range([
      fixedBoundary === 'start' ? range[0] - offset : range[0],
      fixedBoundary === 'end' ? range[1] + offset : range[1],
    ])
    scale.paddingInner(fixedPaddingInner / (fixedPaddingInner + fixedBandwidth))
  } else if (isNumber(fixedBandwidth)) {
    scale.paddingInner(1 - (fixedBandwidth * domain.length) / distance)
  } else if (isNumber(fixedPaddingInner)) {
    scale.paddingInner((fixedPaddingInner * (domain.length - 1)) / distance)
  } else if (nice) {
    scale.paddingInner(paddingInner ?? 0)
  }

  return scale
}
