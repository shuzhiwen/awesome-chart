import {CircleDrawerProps} from '../types'
import {drawEllipse} from './ellipse'

export function drawCircle({data = [], ...rest}: CircleDrawerProps) {
  return drawEllipse({
    data: data.map(({r, ...rest}) => ({...rest, rx: r, ry: r})),
    ...rest,
  })
}
