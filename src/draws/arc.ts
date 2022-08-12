import {arc} from 'd3-shape'
import {drawPath} from './path'
import {ArcDrawerProps} from '../types'

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
