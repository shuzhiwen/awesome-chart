import {merge} from 'lodash'
import {Graphics} from 'pixi.js'
import {svgEasing} from '../animation'
import {PathDrawerProps} from '../types'
import {getAttr, noChange, isCC, isSC, splitAlpha} from '../utils'
import {selector} from '../layers'

export function drawPath({
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
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
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
      // transition occur attribute attach delay
      .style('transform', (d) => `translate(${d.centerX}px,${d.centerY}px)`)
  }

  if (isCC(container)) {
    container.removeChild(...selector.getChildren(container, className))
    mappedData.forEach((d) => {
      const graphics = new Graphics()
      graphics.data = d
      graphics.alpha = d.opacity
      graphics.className = d.className
      graphics.interactive = d.evented
      graphics.pivot = {x: d.centerX, y: d.centerY}
      graphics.position = {x: d.centerX, y: d.centerY}
      graphics.cursor = d.evented ? 'pointer' : 'auto'
      graphics
        .lineStyle(d.strokeWidth, ...splitAlpha(d.stroke, d.strokeOpacity))
        .beginFill(...splitAlpha(d.fill, d.fillOpacity))
        .drawPath(d.path, [d.centerX, d.centerY])
        .endFill()
      container.addChild(graphics)
    })
  }
}
