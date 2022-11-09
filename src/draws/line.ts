import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {ILineOptions} from 'fabric/fabric-impl'
import {LineDrawerProps} from '../types'
import {isCC, isSC, noChange, mergeAlpha, getAttr} from '../utils'
import {selector} from '../layers'
import {merge} from 'lodash'

export function drawLine({
  rotation,
  stroke,
  strokeWidth,
  opacity,
  strokeOpacity,
  strokeDasharray,
  transformOrigin,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
  evented,
}: LineDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    rotation: getAttr(rotation, i, 0),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    transformOrigin: getAttr(transformOrigin, i, `${item.x1} ${item.y1}`),
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
      .join('line')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .attr('stroke', (d) => d.stroke)
      .attr('opacity', (d) => d.opacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('stroke-dasharray', (d) => d.strokeDasharray)
      .attr('transform-origin', (d) => d.transformOrigin)
      .attr('transform', (d) => `rotate(${d.rotation})`)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
  }

  if (isCC(container)) {
    container.remove(...selector.getChildren(container, className))
    mappedData.forEach((config) => {
      const line = new fabric.Line([config.x1, config.y1, config.x2, config.y2], {
        className: config.className,
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeDashArray: config.strokeDasharray.split(' ').map(Number),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
        evented: config.evented,
        originX: 'center',
      } as ILineOptions)
      container.addWithUpdate(line)
    })
  }
}
