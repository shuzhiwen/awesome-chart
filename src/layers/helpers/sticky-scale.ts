import {ScaleBand} from '../../types'

export function stickyBandScale(scale: ScaleBand, value: number) {
  const [min] = scale.range(),
    index = Math.round((value - min) / scale.step()),
    domainValue = scale.domain()[index]

  return scale(domainValue)
}
