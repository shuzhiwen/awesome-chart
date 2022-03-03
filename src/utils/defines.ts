import * as d3 from 'd3'
import {fabric} from 'fabric'
import {isArray} from 'lodash'
import {mergeAlpha, uuid, isSvgContainer} from '.'
import {
  GradientCreatorProps,
  GradientWithId,
  LinearGradientSchema,
  RadialGradientSchema,
  CreateDefsSchema,
  EasyGradientCreatorProps,
  MaskSchema,
} from '../types'

export const createLinearGradients = ({
  container,
  schema,
  engine,
}: GradientCreatorProps<LinearGradientSchema[]>) => {
  schema.forEach(({id, x1 = 0, x2 = 0, y1 = 0, y2 = 0, stops}) => {
    if (engine === 'svg' && isSvgContainer(container)) {
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
    } else if (engine === 'canvas' && isArray(container)) {
      const gradient: GradientWithId = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'percentage',
        coords: {x1, y1, x2, y2},
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

export const createRadialGradients = ({
  container,
  schema,
  engine,
}: GradientCreatorProps<RadialGradientSchema[]>) => {
  schema.forEach(({id, r = 0, r2 = 0, x1 = 1, x2 = 1, y1 = 0, y2 = 0, stops}) => {
    if (engine === 'svg' && isSvgContainer(container)) {
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
    } else if (engine === 'canvas' && isArray(container)) {
      const gradient: GradientWithId = new fabric.Gradient({
        type: 'radial',
        gradientUnits: 'percentage', // or 'pixels'
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

export const createMasks = ({container, schema, engine}: GradientCreatorProps<MaskSchema[]>) => {
  if (engine === 'svg' && isSvgContainer(container)) {
    schema.forEach((item) => {
      const {id, type, fill} = item
      const mask = container.append('mask').attr('id', id)
      if (type === 'rect') {
        const {x = 0, y = 0, width = '100%', height = '100%'} = item
        mask
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('fill', fill)
          .attr('width', width)
          .attr('height', height)
      } else if (type === 'circle') {
        const {cx = 0.5, cy = 0.5, rx = 0.5, ry = 0.5} = item
        mask
          .append('ellipse')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('rx', rx)
          .attr('ry', ry)
          .attr('fill', fill)
      } else if (type === 'arc') {
        const {innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0} = item
        const arc = d3.arc()
        // visible area
        mask
          .append('path')
          .attr('fill', 'rgb(255,255,255)')
          .attr('d', arc({startAngle: 0, endAngle: Math.PI * 2, innerRadius, outerRadius}))
        // invisible area
        mask
          .append('path')
          .attr('fill', 'rgb(0,0,0)')
          .attr('d', arc({startAngle, endAngle, innerRadius, outerRadius}))
      }
    })
  }
}

export const createDefs = ({container, schema, engine}: GradientCreatorProps<CreateDefsSchema>) => {
  const {linearGradient, radialGradient, mask} = schema
  linearGradient && createLinearGradients({container, schema: linearGradient, engine})
  radialGradient && createRadialGradients({container, schema: radialGradient, engine})
  mask && createMasks({container, schema: mask, engine})
}

// syntactic sugar to create gradients
export const getEasyGradientCreator =
  ({container, engine}: Pick<GradientCreatorProps<any>, 'container' | 'engine'>) =>
  ({type, colors, direction, ...other}: EasyGradientCreatorProps) => {
    const id = uuid()
    const stops = colors.map((color, i) => ({
      offset: i / (colors.length - 1),
      color,
    }))

    createDefs({
      container,
      engine,
      schema: {
        radialGradient: type === 'radial' && [{id, r2: 1, stops, ...other}],
        linearGradient: type === 'linear' && [
          {
            id,
            x2: direction === 'horizontal' ? 1 : 0,
            y2: direction === 'vertical' ? 1 : 0,
            stops,
            ...other,
          },
        ],
      },
    })

    if (engine === 'svg' && isSvgContainer(container)) {
      return `url(#${id})`
    } else if (engine === 'canvas' && isArray(container)) {
      return container.find((gradient) => gradient.id === id, false)
    }
  }
