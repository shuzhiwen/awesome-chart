import chroma from 'chroma-js'
import {Application, Graphics, Texture} from 'pixi.js'
import {createLog, mergeAlpha, safeLoop} from '../utils'
import {ElConfig} from '../types'

type Position = [number, number]

const log = createLog('Extension')

declare module 'pixi.js' {
  interface Graphics {
    drawPath(d: string, offset?: Position): Graphics
    dashLineTo(x: number, y: number, dasharray: string): Graphics
    className?: string
    data?: ElConfig
  }
  interface Container {
    getApp?(): Application
    className?: string
  }
  interface Texture {
    gradientId?: string
  }
}

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
    position: Position = [xFrom, yFrom]
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

function getPosition(
  instance: Graphics,
  command: string,
  position: [Maybe<number>, Maybe<number>],
  offset: Position = [0, 0]
): Position {
  const [x, y] = instance.currentPath?.points.slice(-2) || [0, 0]
  const _position: Position = [position[0] || x, position[1] || y]

  if (/[MLHVCSQTAZ]/.test(command)) {
    return [_position[0] + offset[0], _position[1] + offset[1]]
  } else {
    return [x + _position[0], y + _position[1]]
  }
}

function generateCommandData(d: string) {
  const commands = d.match(/[MLHVCSQTAZ]/gi)
  const data = d
    .trim()
    .split(/[MLHVCSQTAZ]/gi)
    .slice(1)
    .map((item) => item.trim().split(/,|\s+/gi))

  return commands?.map((command, i) => ({
    command,
    data: data[i].map(Number),
  }))
}

Graphics.prototype.drawPath = function (d: string, offset?: Position) {
  try {
    generateCommandData(d)?.map(({command, data}) => {
      if (/M/i.test(command)) {
        this.moveTo(...getPosition(this, command, data as Position, offset))
      } else if (/L/i.test(command)) {
        this.lineTo(...getPosition(this, command, data as Position, offset))
      } else if (/H/i.test(command)) {
        this.lineTo(...getPosition(this, command, [data[0], null], offset))
      } else if (/V/i.test(command)) {
        this.lineTo(...getPosition(this, command, [null, data[0]], offset))
      } else if (/C/i.test(command)) {
        this.bezierCurveTo(
          ...getPosition(this, command, data.slice(0, 2) as Position, offset),
          ...getPosition(this, command, data.slice(2, 4) as Position, offset),
          ...getPosition(this, command, data.slice(4, 6) as Position, offset)
        )
      } else if (/Q/i.test(command)) {
        this.quadraticCurveTo(
          ...getPosition(this, command, data.slice(0, 2) as Position, offset),
          ...getPosition(this, command, data.slice(2, 4) as Position, offset)
        )
      } else if (/Z/i.test(command)) {
        this.closePath()
      } else {
        log.warn('The command is not supported, fallback to texture rendering')
        throw new Error()
      }
    })
  } catch {
    const {line, fill} = this,
      {x, y} = this.getGlobalPosition(),
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d')!,
      path = new Path2D(d)

    canvas.width = x * 2
    canvas.height = y * 2
    ctx.fillStyle = mergeAlpha(chroma(fill.color).hex(), fill.alpha)
    ctx.strokeStyle = mergeAlpha(chroma(line.color).hex(), line.alpha)
    ctx.translate(x, y)
    ctx.stroke(path)
    ctx.fill(path)

    this.clear()
    this.beginTextureFill({texture: Texture.from(canvas)})
    this.lineTextureStyle({texture: Texture.from(canvas), width: line.width})
    this.drawRect(0, 0, x * 2, y * 2)
    this.x -= x
    this.y -= y
  }

  return this
}
