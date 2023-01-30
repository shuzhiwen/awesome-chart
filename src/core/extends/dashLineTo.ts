import {Graphics} from 'pixi.js'
import {safeLoop} from '../..'

Graphics.prototype.dashLineTo = function (
  this: Graphics,
  xTo: number,
  yTo: number,
  dasharray: string
) {
  const points = this.currentPath.points,
    xFrom = points[points.length - 2],
    yFrom = points[points.length - 1],
    dashes = dasharray.split(' ').map(Number),
    originSign = [xTo - xFrom, yTo - yFrom].map(Math.sign),
    sign = xTo === xFrom ? -Math.sign(yTo - yFrom) : Math.sign(xTo - xFrom),
    theta = xTo === xFrom ? Math.PI / 2 : Math.atan((yFrom - yTo) / (xTo - xFrom)),
    position: Vec2 = [xFrom, yFrom]
  let isSolid = true

  if (!dasharray || (xTo === xFrom && yTo === yFrom)) {
    this.lineTo(xTo, yTo)
    return this
  }

  safeLoop(
    () =>
      Math.sign(xTo - position[0]) === originSign[0] &&
      Math.sign(yTo - position[1]) === originSign[1],
    () => {
      const step = dashes[dashes.push(dashes.shift()!) - 1]
      position[0] += Math.cos(theta) * step * sign
      position[1] -= Math.sin(theta) * step * sign

      if (
        Math.sign(xTo - position[0]) !== originSign[0] ||
        Math.sign(yTo - position[1]) !== originSign[1]
      ) {
        position[0] = xTo
        position[1] = yTo
      }

      isSolid ? this.lineTo(...position) : this.moveTo(...position)
      isSolid = !isSolid
    }
  )

  return this
}
