import {arc} from 'd3-shape'
import {drawPath} from './path'
import {ArcDrawerProps} from '../types'

export function drawArc({data = [], ...rest}: ArcDrawerProps) {
  return drawPath({
    data: data.map(({centerX, centerY, ...rest}) => ({path: arc()(rest)!, centerX, centerY})),
    ...rest,
  })
}
