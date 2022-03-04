import * as d3 from 'd3'
import {fabric} from 'fabric'
import {IPathOptions} from 'fabric/fabric-impl'
import {CurveDrawerProps} from '../types'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'

export function drawCurve({
  engine,
  stroke,
  opacity,
  strokeOpacity,
  strokeWidth,
  strokeDasharray = '',
  enableUpdateAnimation = false,
  updateAnimationDuration = 2000,
  updateAnimationDelay = 0,
  mapping = noChange,
  source = [],
  data = [],
  container,
  className,
  ...rest
}: CurveDrawerProps) {
  const configuredData = data.map(({points, curve}, i) => ({
    ...rest,
    className,
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 0),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    source: getAttr(source, i, {}),
    path: d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3[curve])(points.map(({x, y}) => [x, y])),
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('path')
      .attr('class', (d) => d.className)
      .transition()
      .duration(enableUpdateAnimation ? updateAnimationDuration : 0)
      .delay(enableUpdateAnimation ? updateAnimationDelay : 0)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('stroke-dasharray', (d) => d.strokeDasharray)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('opacity', (d) => d.opacity)
      .attr('d', (d) => d.path)
      .attr('fill', 'none')
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    configuredData.forEach((config) => {
      const path = new fabric.Path(config.path!, {
        className: config.className,
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeDashArray: String(config.strokeDasharray).trim().split(' ').map(Number),
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
