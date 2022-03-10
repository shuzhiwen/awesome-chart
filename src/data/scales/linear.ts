import {scaleLinear} from 'd3'
import {ScaleLinearProps} from '../../types'

export function ScaleLinear({domain, range, nice}: ScaleLinearProps) {
  const scale = scaleLinear().domain(domain).range(range)

  nice.zero && extendZeroForScale(scale)
  nice.count && niceScale(scale, nice.count)

  return scale
}

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

export function niceScale(scale: d3.ScaleLinear<number, number>, tick: number) {
  let [start, end] = scale.domain(),
    reverse = false

  if (start === end) {
    if (start === 0) {
      end += tick
    } else {
      start -= tick
      end += tick
    }
  } else if (start >= end) {
    ;[start, end] = [end, start]
    reverse = true
  }

  if (tick > 1) {
    const distance = end - start,
      magnitude = 10 ** Math.floor(Math.log10(Math.abs(distance / tick))),
      spaceThreshold = 0.1

    // step to ensure that the chart will not overflow
    let step = Math.ceil(distance / tick / magnitude) * magnitude,
      niceStart = Math.floor(start / step) * step,
      niceEnd = niceStart + tick * step

    if (niceEnd > end) {
      const isOverflow = () => end + (magnitude / 2) * tick >= niceEnd,
        isExceedThreshold = () => (niceEnd - end) / (niceEnd - niceStart) > spaceThreshold

      while (!isOverflow() && isExceedThreshold()) {
        step -= magnitude / 2
        niceEnd = niceStart + tick * step
      }
    }

    while (niceEnd < end) {
      step += magnitude / 2
      niceEnd = niceStart + tick * step
    }

    scale.domain(reverse ? [niceEnd, niceStart] : [niceStart, niceEnd])
  }
}
