import {fabric} from 'fabric'
import {isArray, merge} from 'lodash'
import {IRectOptions} from 'fabric/fabric-impl'
import {mergeAlpha, getAttr, isSC, isCC, noChange} from '../utils'
import {DrawerData, RectDrawerProps} from '../types'
import {svgEasing} from '../animation'
import {selector} from '../layers'

export function drawRect({
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  transformOrigin,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
  evented,
}: RectDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    fill: getAttr(fill, i, graph.fill),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    fillOpacity: getAttr(fillOpacity, i, graph.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    transformOrigin: getAttr(transformOrigin, i, ''),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, []),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('rect')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('rx', (d) => d.rx || 0)
      .attr('ry', (d) => d.ry || 0)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('opacity', (d) => d.opacity)
      .attr('transform-origin', (d) => getTransformOrigin(d, d.transformOrigin))
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
  }

  if (isCC(container)) {
    container.remove(...selector.getChildren(container, className))
    mappedData.forEach((config) => {
      const rect = new fabric.Rect({
        className: config.className,
        top: config.y,
        left: config.x,
        width: config.width,
        height: config.height,
        rx: config.rx,
        ry: config.ry,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
        evented: config.evented,
        ...getTransformFabricAttr(config, config.transformOrigin),
      } as IRectOptions)
      container.addWithUpdate(rect)
    })
  }
}

const getTransformOrigin = (
  data: DrawerData<RectDrawerProps>,
  origin: ArrayItem<RectDrawerProps['transformOrigin']>
) => {
  const {x, y, width, height} = data

  switch (origin) {
    case 'center':
      return `${x + width / 2}px ${y + height / 2}px`
    case 'left':
      return `${x}px ${y + height / 2}px`
    case 'right':
      return `${x + width}px ${y + height / 2}px`
    case 'top':
      return `${x + width / 2}px ${y}px`
    case 'bottom':
      return `${x + width / 2}px ${y + height}px`
    default:
      return isArray(origin) ? `${origin[0]}px ${origin[1]}px` : ''
  }
}

const getTransformFabricAttr = (
  data: DrawerData<RectDrawerProps>,
  origin: ArrayItem<RectDrawerProps['transformOrigin']>
) => {
  const {x, y, width, height} = data

  switch (origin) {
    case 'center':
      return {
        left: x + width / 2,
        top: y + height / 2,
        originX: 'center',
        originY: 'center',
      }
    case 'top':
      return {
        left: x + width / 2,
        top: y,
        originX: 'center',
        originY: 'top',
      }
    case 'bottom':
      return {
        left: x + width / 2,
        top: y + height,
        originX: 'center',
        originY: 'bottom',
      }
    case 'left':
      return {
        left: x,
        top: y + height / 2,
        originX: 'left',
        originY: 'center',
      }
    case 'right':
      return {
        left: x + width,
        top: y + height / 2,
        originX: 'right',
        originY: 'center',
      }
    default:
      return null
  }
}
