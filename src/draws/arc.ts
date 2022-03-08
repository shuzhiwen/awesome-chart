import * as d3 from 'd3'
import {fabric} from 'fabric'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'
import {ArcDrawerProps} from '../types'
import {IPathOptions} from 'fabric/fabric-impl'

export function drawArc({
  engine,
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  enableUpdateAnimation = false,
  updateAnimationDuration = 2000,
  updateAnimationDelay = 0,
  mapping = noChange,
  source = [],
  data = [],
  container,
  className,
  ...rest
}: ArcDrawerProps) {
  const configuredData = data.map((item, i) => {
    return {
      ...rest,
      ...item,
      className,
      fill: getAttr(fill, i, '#fff'),
      stroke: getAttr(stroke, i, '#fff'),
      opacity: getAttr(opacity, i, 1),
      fillOpacity: getAttr(fillOpacity, i, 1),
      strokeOpacity: getAttr(strokeOpacity, i, 1),
      strokeWidth: getAttr(strokeWidth, i, 0),
      source: getAttr(source, i, {}),
      path: d3.arc()(item),
    }
  })

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('path')
      .attr('class', (d) => d.className)
      .transition()
      .duration(enableUpdateAnimation ? updateAnimationDuration : 0)
      .delay(enableUpdateAnimation ? updateAnimationDelay : 0)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('d', (d) => d.path)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .style('transform', (d) => `translate(${d.centerX}px,${d.centerY}px)`)
      .style('outline', 'none')
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    configuredData.forEach((config) => {
      const path = new fabric.Path(config.path!, {
        className: config.className,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
        selectable: false,
      } as IPathOptions)
      path.left = path.left ? path.left + config.centerX : config.centerX
      path.top = path.top ? path.top + config.centerY : config.centerY
      container.add(path)
    })
  }

  return configuredData
}