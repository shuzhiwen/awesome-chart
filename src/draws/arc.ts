import {arc} from 'd3'
import {ArcDrawerProps} from '../types'
import {parsePathString} from '../utils'
import {drawPath} from './path'

export function drawArc({data = [], ...rest}: ArcDrawerProps) {
  return drawPath({
    data: data.map(({centerX, centerY, cornerRadius, ...rest}) => ({
      centerX,
      centerY,
      path: moveArc({
        path: arc().cornerRadius(cornerRadius ?? 0)(rest)!,
        centerX,
        centerY,
      }),
    })),
    ...rest,
  })
}

export function moveArc(props: {
  path: string
  centerX: number
  centerY: number
}) {
  const {path, centerX, centerY} = props
  const commands = parsePathString(path)

  commands.forEach(({command, data}) => {
    if (command === 'M' || command === 'L') {
      data[0] += centerX
      data[1] += centerY
    } else if (command === 'A') {
      data[5] += centerX
      data[6] += centerY
    }
  })

  return commands
    .map(({command, data}) => `${command}${data.join(',')}`)
    .join('')
}
