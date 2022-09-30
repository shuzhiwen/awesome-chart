import {fabric} from 'fabric'
import {isArray} from 'lodash'
import {uuid} from './random'
import {Gradient} from 'fabric/fabric-impl'
import {group, isSC, mergeAlpha} from '.'
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
  schema.forEach(({id, x1 = 0, x2 = 0, y1 = 0, y2 = 0, stops}) => {
    if (isSC(container)) {
      const linearGradient = container
        .append('linearGradient')
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
    } else if (isArray(container)) {
      const gradient: Gradient = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'percentage',
        coords: {x1, y1, x2, y2},
        colorStops: stops.map(({offset = 1, opacity, color = '#fff'}) => ({
          color: opacity ? mergeAlpha(color, opacity) : color,
          offset,
        })),
      })
      gradient.id = id
      container.push(gradient)
    }
  })
}

export const createRadialGradients = ({
  container,
  schema,
}: GradientCreatorProps<RadialGradientSchema[]>) => {
  schema.forEach(({id, r = 0, r2 = 0, x1 = 0.5, x2 = 0.5, y1 = 0.5, y2 = 0.5, stops}) => {
    if (isSC(container)) {
      const radialGradient = container
        .append('radialGradient')
        .attr('id', id)
        .attr('r', Math.max(r, r2))
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
    } else if (isArray(container)) {
      const gradient: Gradient = new fabric.Gradient({
        type: 'radial',
        gradientUnits: 'percentage',
        coords: {x1, y1, x2, y2, r1: r, r2},
        colorStops: stops.map(({offset = 1, opacity = 1, color = '#fff'}) => ({
          color: mergeAlpha(color, opacity) as string,
          offset,
        })),
      })
      gradient.id = id
      container.push(gradient)
    }
  })
}

export const createDefs = (props: GradientCreatorProps<CreateDefsSchema>) => {
  const {container, schema} = props,
    {linearGradient, radialGradient} = schema

  createLinearGradients({container, schema: group(linearGradient)})
  createRadialGradients({container, schema: group(radialGradient)})
}

export const getEasyGradientCreator =
  ({container}: Pick<GradientCreatorProps<any>, 'container'>) =>
  ({type, colors, direction, ...other}: EasyGradientCreatorProps) => {
    const schema: CreateDefsSchema = {},
      baseSchema = {
        id: uuid(),
        stops: colors.map((color, i) => ({
          offset: i / (colors.length - 1),
          color,
        })),
      }

    if (type === 'radial') {
      schema.radialGradient = {r2: 0.5, ...baseSchema, ...other}
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
    } else if (isArray(container)) {
      return container.find((gradient) => gradient.id === baseSchema.id, false)
    }
  }
