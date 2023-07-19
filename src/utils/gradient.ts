import {Texture} from 'pixi.js'
import {group, isSC, mergeAlpha} from '.'
import {
  CreateDefsSchema,
  EasyGradientCreatorProps,
  GradientCreatorProps,
  LinearGradientSchema,
  RadialGradientSchema,
} from '../types'
import {uuid} from './random'

export const createLinearGradients = ({
  container,
  schema,
}: GradientCreatorProps<LinearGradientSchema[]>) => {
  schema.forEach(({id, x1 = 0, x2 = 0, y1 = 0, y2 = 0, stops, ...rest}) => {
    if (isSC(container)) {
      const linearGradient = container
        .append('linearGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('id', id)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        linearGradient
          .append('stop')
          .attr('offset', offset)
          .style('stop-color', color)
          .style('stop-opacity', opacity)
      })
    } else {
      const {width = 100, height = 100} = rest,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        gradient = ctx.createLinearGradient(x1, y1, x2, y2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        gradient.addColorStop(offset, mergeAlpha(color, opacity))
      })

      canvas.width = width
      canvas.height = height
      ctx.fillStyle = gradient
      ctx.fillRect(x1, y1, width, height)
      container.push(Object.assign(Texture.from(canvas), {gradientId: id}))
    }
  })
}

export const createRadialGradients = ({
  container,
  schema,
}: GradientCreatorProps<RadialGradientSchema[]>) => {
  schema.forEach(({id, x1 = 0, x2 = 0, y1 = 0, y2 = 0, stops, ...rest}) => {
    const {r = 0, r2 = 0, width, height} = rest

    if (width) (x1 *= width), (x2 *= width)
    if (height) (y1 *= height), (y2 *= height)

    if (isSC(container)) {
      const radialGradient = container
        .append('radialGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('id', id)
        .attr('fx', x1)
        .attr('fy', y1)
        .attr('fr', r)
        .attr('cx', x2)
        .attr('cy', y2)
        .attr('r', r2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        radialGradient
          .append('stop')
          .attr('offset', offset)
          .style('stop-color', color)
          .style('stop-opacity', opacity)
      })
    } else {
      const [_width, _height] = [width ?? 100, height ?? 100],
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        gradient = ctx.createRadialGradient(x1, y1, r, x2, y2, r2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        gradient.addColorStop(offset, mergeAlpha(color, opacity))
      })

      canvas.width = _width
      canvas.height = _height
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, _width, _height)
      container.push(Object.assign(Texture.from(canvas), {gradientId: id}))
    }
  })
}

/**
 * Linear gradients and radial gradients creator.
 * @param props
 * The definition for gradients.
 * @internal
 */
export const createDefs = (props: GradientCreatorProps<CreateDefsSchema>) => {
  const {container, schema} = props,
    {linearGradient, radialGradient} = schema

  createLinearGradients({container, schema: group(linearGradient)})
  createRadialGradients({container, schema: group(radialGradient)})
}

/**
 * Simple linear gradients and radial gradients creator.
 * @param props
 * The definition for easy gradients.
 * @internal
 */
export const getEasyGradientCreator = ({
  container,
}: Pick<GradientCreatorProps<unknown>, 'container'>) => {
  return ({type, colors, direction, ...other}: EasyGradientCreatorProps) => {
    const schema: CreateDefsSchema = {},
      baseSchema = {
        id: uuid(),
        stops: colors.map((color, i) => ({
          offset: i / (colors.length - 1),
          color,
        })),
      }

    if (type === 'radial') {
      schema.radialGradient = {
        ...baseSchema,
        ...other,
      }
    } else {
      schema.linearGradient = {
        x2: direction === 'horizontal' ? 1 : 0,
        y2: direction === 'vertical' ? 1 : 0,
        ...baseSchema,
        ...other,
      }
    }

    createDefs({container, schema})
    if (isSC(container)) {
      return `url(#${baseSchema.id})`
    } else {
      return container.find((item) => item.gradientId === baseSchema.id)!
    }
  }
}
