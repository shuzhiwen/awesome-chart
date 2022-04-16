import {fabric} from 'fabric'
import {mergeAlpha, getAttr, noChange, isCanvasContainer, isSvgContainer} from '../utils'
import {PathDrawerProps} from '../types'
import {IPathOptions} from 'fabric/fabric-impl'

export function drawPath({
  engine,
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  transformOrigin,
  enableUpdateAnimation = false,
  updateAnimationDuration = 2000,
  updateAnimationDelay = 0,
  mapping = noChange,
  source = [],
  data = [],
  container,
  className,
  ...rest
}: PathDrawerProps) {
  const configuredData = data.map((item, i) => ({
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
    transformOrigin: getAttr(transformOrigin, i, ''),
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
      .attr('d', (d) => d.path)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .style('transform-origin', (d) => d.transformOrigin)
      .style('transform', (d) => `translate(${d.centerX}px,${d.centerY}px)`)
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
      const path = new fabric.Path(config.path, {
        className: config.className,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as IPathOptions)
      path.left = path.left ? path.left + config.centerX : config.centerX
      path.top = path.top ? path.top + config.centerY : config.centerY
      container.addWithUpdate(path)
    })
    container.canvas?.requestRenderAll()
  }

  return configuredData
}
