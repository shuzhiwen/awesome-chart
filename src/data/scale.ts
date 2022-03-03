import {isNumber} from 'lodash'
import {ScaleArcProps, ScaleBandProps, ScaleLinearProps} from '../types'
import * as d3 from 'd3-scale'

const defaultNice = {
  count: 0,
  zero: false,
  paddingInner: 0,
}

// discrete to continuous
export function ScaleBand({domain, range, nice = defaultNice}: ScaleBandProps) {
  const scale = d3.scaleBand().domain(domain).range(range)

  if (isNumber(nice.fixedBandwidth) && isNumber(nice.fixedPaddingInner)) {
    const {fixedBandwidth, fixedPaddingInner, fixedBoundary} = nice
    const totalRange = fixedBandwidth * domain.length + fixedPaddingInner * (domain.length - 1)
    const offset = (totalRange - Math.abs(range[1] - range[0])) * (range[1] > range[0] ? 1 : -1)
    const [fixedStart, fixedEnd] = [fixedBoundary === 'start', fixedBoundary === 'end']
    // fixed bandwidth and padding
    scale.range([
      fixedEnd ? range[0] - offset : range[0],
      fixedStart ? range[1] + offset : range[1],
    ])
    scale.paddingInner(fixedPaddingInner / (fixedPaddingInner + fixedBandwidth))
  } else if (isNumber(nice.fixedBandwidth)) {
    // auto padding
    scale.paddingInner(1 - (nice.fixedBandwidth * domain.length) / Math.abs(range[1] - range[0]))
  } else if (isNumber(nice.fixedPaddingInner)) {
    // auto bandwidth
    scale.paddingInner(
      (nice.fixedPaddingInner * (domain.length - 1)) / Math.abs(range[1] - range[0])
    )
  } else if (nice) {
    // auto according ratio
    scale.paddingInner(isNumber(nice.paddingInner) ? nice.paddingInner : defaultNice.paddingInner)
  }

  return scale
}

// only for arc layer
export function ScaleArc({domain, range, nice}: ScaleArcProps) {
  const scale = d3.scaleOrdinal()

  if (isNumber(nice.paddingInner)) {
    const totalLength = range[1] - range[0]
    const padding = (totalLength * nice.paddingInner) / domain.data[0].list.length
    const availableLength = totalLength * (1 - nice.paddingInner)
    const mappingArray = domain.data[1].list
      .reduce(
        (prev, cur, index) => {
          const startAngle = prev[index].endAngle + padding
          const endAngle = startAngle + availableLength * (cur as number)
          return [...prev, {startAngle, endAngle}]
        },
        [{endAngle: -padding}]
      )
      .slice(1)
    scale.domain(domain.data[0].list as string[]).range(mappingArray)
  }

  return scale
}

// continuous to continuous
export function ScaleLinear({domain, range, nice}: ScaleLinearProps) {
  const scale = d3.scaleLinear().domain(domain).range(range)

  nice.zero && extendZeroForScale(scale)
  nice.count && niceScale(scale, nice.count)

  return scale
}

// extend domain so that contains zero
export function extendZeroForScale(scale: d3.ScaleLinear<number, number>) {
  let [start, end] = scale.domain()

  if (start <= end) {
    if (start > 0) {
      start = 0
    } else if (end < 0) {
      end = 0
    }
  } else {
    if (start < 0) {
      start = 0
    } else if (end > 0) {
      end = 0
    }
  }

  scale.domain([start, end])
}

// d3 default nice function is not suitable for us
export function niceScale(scale: d3.ScaleLinear<number, number>, tick: number) {
  let [start, end] = scale.domain()
  // start must different from end
  if (start === end) {
    if (start === 0) {
      end += tick
    } else {
      start -= tick
      end += tick
    }
  }
  // order
  let reverse = false
  if (start >= end) {
    ;[start, end] = [end, start]
    reverse = true
  }
  // change domain
  if (tick > 0) {
    const distance = end - start
    const level = 10 ** Math.floor(Math.log10(Math.abs(distance / tick)))
    // the blank ratio at the top of the chart
    const spaceThreshold = 0
    // step to ensure that the chart will not overflow
    let step = Math.ceil(distance / tick / level) * level
    let newStart = Math.floor(start / step) * step
    let newEnd = newStart + tick * step
    // too much blank
    if (newEnd > end) {
      const isOverflow = () => end + (level / 2) * tick >= newEnd
      const isExceedThreshold = () => (newEnd - end) / (newEnd - newStart) > spaceThreshold
      while (!isOverflow() && isExceedThreshold()) {
        step -= level / 2
        newEnd = newStart + tick * step
      }
    }
    // overflow
    while (newEnd < end) {
      step += level / 2
      newEnd = newStart + tick * step
    }
    // nice domain
    scale.domain(reverse ? [newEnd, newStart] : [newStart, newEnd])
  }
}
