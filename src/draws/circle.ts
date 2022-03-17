import {CircleDrawerProps} from '../types'
import {drawEllipse} from './ellipse'

export function drawCircle({data = [], ...rest}: CircleDrawerProps) {
  return drawEllipse({
    data: data.map(({r, x, y}) => ({cx: x, cy: y, rx: r, ry: r})),
    ...rest,
  })
}
