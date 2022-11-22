import {ScaleBand} from '../../types'

/**
 * Given a value in the range of a scale, find the nearest domain.
 * @param scale
 * This method only supports `ScaleBand`.
 * @param value
 * The value in the range.
 * @returns
 * The nearest domain and associated range.
 */
export function stickyBandScale(scale: ScaleBand, value: number) {
  const [min] = scale.range(),
    index = Math.round((value - min - scale.bandwidth() / 2) / scale.step()),
    domain = scale.domain()[index]

  return {
    domain: domain,
    value: (scale(domain) ?? 0) + scale.bandwidth() / 2,
  }
}
