import {ScaleBand} from '../../types'

export function stickyBandScale(scale: ScaleBand, value: number) {
  const [min] = scale.range(),
    index = Math.round((value - min - scale.bandwidth() / 2) / scale.step()),
    domain = scale.domain()[index]

  return {
    domain: domain,
    value: scale(domain) ?? 0,
  }
}
