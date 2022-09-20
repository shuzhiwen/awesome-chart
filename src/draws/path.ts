import {fabric} from 'fabric'
import {PathDrawerProps} from '../types'
import {IPathOptions} from 'fabric/fabric-impl'
import {svgEasing} from '../animation'
import {mergeAlpha, getAttr, noChange, isCanvasCntr, isSvgCntr} from '../utils'
import {selector} from '../layers'
import {merge} from 'lodash'

export function drawPath({
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
}: PathDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    className,
    path: item.path,
    centerX: item.centerX ?? 0,
    centerY: item.centerY ?? 0,
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

  if (isSvgCntr(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('path')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('d', (d) => d.path)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('transform-origin', (d) => d.transformOrigin)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
      // transition occur attribute attach delay
      // css transform will override attr transform
      .style('transform', (d) => `translate(${d.centerX}px,${d.centerY}px)`)
  }

  if (isCanvasCntr(container)) {
    container.remove(...selector.getChildren(container, className))
    mappedData.forEach((config) => {
      const path = new fabric.Path(config.path, {
        className: config.className,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
        evented: config.evented,
        originX: 'center',
        originY: 'center',
      } as IPathOptions)
      path.left = path.left ? path.left + config.centerX : config.centerX
      path.top = path.top ? path.top + config.centerY : config.centerY
      container.addWithUpdate(path)
    })
  }
}
