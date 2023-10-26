import chroma from 'chroma-js'
import {Graphics, Texture} from 'pixi.js'
import {createLog, mergeAlpha, parsePath} from '../..'
import {svgArcToCanvas} from './arcTranslate'

function getPosition(
  this: Graphics,
  command: string,
  position: [Maybe<number>, Maybe<number>]
): Vec2 {
  const [x, y] = this.currentPath?.points.slice(-2) || [0, 0]
  const _position: Vec2 = [position[0] ?? x, position[1] ?? y]

  if (/[MLHVCSQTAZ]/.test(command)) {
    return _position
  } else {
    return [x + _position[0], y + _position[1]]
  }
}

Graphics.prototype.drawPath = function (d: string) {
  try {
    parsePath(d).map(({command, data}) => {
      const position = getPosition.bind(this, command)

      if (/M/i.test(command)) {
        this.moveTo(...position(data as Vec2))
      } else if (/L/i.test(command)) {
        this.lineTo(...position(data as Vec2))
      } else if (/H/i.test(command)) {
        this.lineTo(...position([data[0], null]))
      } else if (/V/i.test(command)) {
        this.lineTo(...position([null, data[0]]))
      } else if (/C/i.test(command)) {
        this.bezierCurveTo(
          ...position(data.slice(0, 2) as Vec2),
          ...position(data.slice(2, 4) as Vec2),
          ...position(data.slice(4, 6) as Vec2)
        )
      } else if (/Q/i.test(command)) {
        this.quadraticCurveTo(
          ...position(data.slice(0, 2) as Vec2),
          ...position(data.slice(2, 4) as Vec2)
        )
      } else if (/A/i.test(command)) {
        this.arc(
          ...svgArcToCanvas(
            ...getPosition.call(this, command, [null, null]),
            ...(data.slice(0, 5) as [number, number, number, number, number]),
            ...position(data.slice(5) as Vec2)
          )
        )
      } else if (/Z/i.test(command)) {
        this.closePath()
      } else {
        throw new Error('The command is not supported, fallback to texture')
      }
    })
  } catch (error) {
    createLog('drawPath').warn((error as Error).message, error)

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
    this.interactive = false
    this.x -= x
    this.y -= y
  }

  return this
}
