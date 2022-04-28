import {fabric} from 'fabric'
import {TextOptions} from 'fabric/fabric-impl'
import {TextDrawerProps} from '../types'
import {mergeAlpha, getAttr, isSvgContainer, isCanvasContainer, noChange} from '../utils'

export function drawText({
  engine,
  fontFamily,
  fontSize,
  fontWeight,
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  shadow,
  rotation,
  transformOrigin,
  writingMode,
  textDecoration,
  mapping = noChange,
  data = [],
  transition,
  container,
  className,
  ...rest
}: TextDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...rest,
    ...item,
    className,
    fontSize: getAttr(fontSize, i, 12),
    fontFamily: getAttr(fontFamily, i, ''),
    fontWeight: getAttr(fontWeight, i, 300),
    fill: getAttr(fill, i, '#fff'),
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    fillOpacity: getAttr(fillOpacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 0),
    rotation: getAttr(rotation, i, 0),
    shadow: getAttr(shadow, i, ''),
    transformOrigin: getAttr(transformOrigin, i, ''),
    writingMode: getAttr(writingMode, i, 'horizontal-tb'),
    textDecoration: getAttr(textDecoration, i, 'none'),
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('text')
      .text((d) => d.value)
      .attr('class', (d) => d.className)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - d.fontSize / 2)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('font-family', (d) => d.fontFamily)
      .attr('font-size', (d) => d.fontSize)
      .attr('font-weight', (d) => d.fontWeight)
      .attr('writing-mode', (d) => d.writingMode)
      .style('text-shadow', (d) => d.shadow)
      .style('text-decoration', (d) => d.textDecoration)
      .style('transform', (d) => `rotate(${d.rotation}deg)`)
      .style('transform-origin', (d) => d.transformOrigin)
      .style('dominant-baseline', 'central')
      .style('pointer-events', 'none')
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
      const text = new fabric.Text(config.value, {
        className: config.className,
        left: config.x,
        top: config.y - config.fontSize,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        shadow: config.shadow,
        linethrough: config.textDecoration === 'line-through',
        overline: config.textDecoration === 'overline',
        underline: config.textDecoration === 'underline',
      } as TextOptions)
      text.rotate(config.rotation)
      container.addWithUpdate(text)
    })
    container.canvas?.requestRenderAll()
  }

  return configuredData
}
