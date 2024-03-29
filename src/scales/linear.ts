import {scaleLinear as d3ScaleLinear, ScaleLinear} from 'd3'
import {ScaleLinearNice, ScaleLinearProps} from '../types'
import {getMagnitude, safeLoop} from '../utils'

type Scale = ScaleLinear<number, number>

export function scaleLinear({domain, range, nice}: ScaleLinearProps) {
  const scale = d3ScaleLinear().domain(domain).range(range)

  if (nice) {
    niceZero(scale, nice)
    niceDomain(scale, nice)
  }

  return scale
}

export function niceZero(scale: Scale, nice: ScaleLinearNice) {
  if (!nice.zero) return

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

export function niceDomain(scale: Scale, nice: ScaleLinearNice) {
  const {count, fixedStart, fixedStep} = nice
  let [start, end] = scale.domain()
  let reverse = false

  if (start === end) {
    if (start === 0) {
      end += 1
    } else {
      start -= 1
      end += 1
    }
  } else if (start > end) {
    ;[start, end] = [end, start]
    reverse = true
  }

  if (count && count > 1) {
    const distance = end - start,
      magnitude = getMagnitude(distance / count),
      maxBlank = 0.1

    // step to ensure that the chart will not overflow
    let step = fixedStep ?? Math.ceil(distance / count / magnitude) * magnitude
    const niceStart = fixedStart ?? Math.floor(start / step) * step
    let niceEnd = niceStart + count * step

    if (fixedStep) {
      safeLoop(
        () => niceEnd < end,
        () => (niceEnd += step)
      )
    } else {
      if (niceEnd > end) {
        const overflow = () => end + (magnitude / 2) * count >= niceEnd,
          currentBlank = () => (niceEnd - end) / (niceEnd - niceStart)

        safeLoop(
          () => !overflow() && currentBlank() > maxBlank,
          () => {
            step -= magnitude / 2
            niceEnd = niceStart + count * step
          }
        )
      }
      safeLoop(
        () => niceEnd < end,
        () => {
          step += magnitude / 2
          niceEnd = niceStart + count * step
        }
      )
    }

    scale.domain(reverse ? [niceEnd, niceStart] : [niceStart, niceEnd])
  }

  if (!count && fixedStep) {
    const niceStart = fixedStart || Math.floor(start / fixedStep) * fixedStep
    const niceEnd =
      niceStart + Math.ceil((end - niceStart) / fixedStep) * fixedStep

    scale.domain(reverse ? [niceEnd, niceStart] : [niceStart, niceEnd])
  }
}
