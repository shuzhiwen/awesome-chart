import * as d3 from 'd3'
import {fabric} from 'fabric'
import {IPathOptions} from 'fabric/fabric-impl'
import {AreaDrawerProps} from '../types'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'

export function drawArea({
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
}: AreaDrawerProps) {
  const configuredData = data.map(({lines, curve}, i) => {
    return {
      ...rest,
      className,
      fill: getAttr(fill, i, '#fff'),
      stroke: getAttr(stroke, i, '#fff'),
      opacity: getAttr(opacity, i, 1),
      fillOpacity: getAttr(fillOpacity, i, 1),
      strokeOpacity: getAttr(strokeOpacity, i, 1),
      strokeWidth: getAttr(strokeWidth, i, 0),
      source: getAttr(source, i, {}),
      path: d3
        .area()
        .y0((d) => d[1])
        .y1((d) => d[0])
        .x((_, i) => lines[i].x)
        .curve(d3[curve])(lines.map(({y1, y2}) => [y1, y2])),
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
      .attr('d', (d) => d.path)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('fill', (d) => d.fill)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .style('pointer-events', 'fill')
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
      container.add(path)
    })
  }

  return configuredData
}
