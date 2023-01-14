import {uuid} from './random'
import {group, isSC, mergeAlpha} from '.'
import {Texture} from 'pixi.js'
import {
  GradientCreatorProps,
  LinearGradientSchema,
  RadialGradientSchema,
  CreateDefsSchema,
  EasyGradientCreatorProps,
} from '../types'

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
  schema.forEach(({id, r = 0, x1 = 0.5, x2 = 0.5, y1 = 0.5, y2 = 0.5, stops, ...rest}) => {
    if (isSC(container)) {
      const radialGradient = container
        .append('radialGradient')
        .attr('id', id)
        .attr('r', r)
        .attr('cx', x1)
        .attr('cy', y1)
        .attr('fx', x2)
        .attr('fy', y2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        radialGradient
          .append('stop')
          .attr('offset', offset)
          .style('stop-color', color)
          .style('stop-opacity', opacity)
      })
    } else {
      const {r2 = 0, width = 100, height = 100} = rest,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        [_x1, _y1, _x2, _y2] = [x1 * width, y1 * height, x2 * width, y2 * height],
        gradient = ctx.createRadialGradient(_x1, _y1, r, _x2, _y2, r2)

      stops.forEach(({offset = 1, opacity = 1, color = '#fff'}) => {
        gradient.addColorStop(offset, mergeAlpha(color, opacity))
      })

      canvas.width = width
      canvas.height = height
      ctx.fillStyle = gradient
      ctx.fillRect(x1, y1, width, height)
      container.push(Object.assign(Texture.from(canvas), {gradientId: id}))

      canvas.style.background = 'green'
      document.body.appendChild(canvas)
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
      schema.radialGradient = {r: 0.5, ...baseSchema, ...other}
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
    }
  }
}
