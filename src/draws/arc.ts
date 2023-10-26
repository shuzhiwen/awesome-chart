import {arc} from 'd3'
import {ArcDrawerProps} from '../types'
import {drawPath} from './path'

export function drawArc({data = [], ...rest}: ArcDrawerProps) {
  return drawPath({
    data: data.map(({centerX, centerY, cornerRadius, ...rest}) => ({
      path: arc().cornerRadius(cornerRadius ?? 0)(rest)!,
      centerX,
      centerY,
    })),
    ...rest,
  })
}
