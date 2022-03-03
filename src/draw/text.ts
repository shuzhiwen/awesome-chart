import {fabric} from 'fabric'
import {TextOptions} from 'fabric/fabric-impl'
import {isArray, isObject} from 'lodash'
import {TextDrawerProps, TextStyleShape} from '../types'
import {mergeAlpha, getAttr, isSvgContainer, isCanvasContainer} from '../utils'

const writingModeMapping = {
  horizontal: 'horizontal-tb',
  vertical: 'vertical-rl',
}

export function drawText({
  engine = 'svg',
  fontFamily = '',
  fontSize = 12,
  fontWeight = 'normal',
  fill = '#fff',
  stroke = '#fff',
  strokeWidth = 0,
  opacity = 1,
  fillOpacity = 1,
  strokeOpacity = 1,
  rotation = 0,
  shadow = '2px 2px 2px rgba(0,0,0,0)',
  writingMode = 'horizontal',
  transformOrigin = null,
  enableUpdateAnimation = false,
  updateAnimationDuration = 2000,
  updateAnimationDelay = 0,
  mapping = (item) => item,
  data = [],
  container,
  className,
}: TextDrawerProps) {
  const configuredData = data.map(({value, x, y}, i) => ({
    value,
    className,
    x,
    y: y + (engine === 'svg' ? -getAttr(fontSize, i) * 0.2 : 0),
    fontSize: getAttr(fontSize, i),
    fontFamily: getAttr(fontFamily, i),
    fontWeight: getAttr(fontWeight, i),
    fill: getAttr(fill, i),
    stroke: getAttr(stroke, i),
    opacity: getAttr(opacity, i),
    fillOpacity: getAttr(fillOpacity, i),
    strokeOpacity: getAttr(strokeOpacity, i),
    strokeWidth: getAttr(strokeWidth, i),
    rotation: getAttr(rotation, i),
    shadow: getShadow(getAttr(shadow, i)),
    transformOrigin: getAttr(transformOrigin, i),
    writingMode: writingModeMapping[writingMode],
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map((item) => mapping(item)))
      .join('text')
      .text((d) => d.value)
      .attr('class', (d) => d.className)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .transition()
      .duration(enableUpdateAnimation ? updateAnimationDuration : 0)
      .delay(enableUpdateAnimation ? updateAnimationDelay : 0)
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
      .style('transform', (d) => (d.rotation ? `rotate(${d.rotation}deg)` : null))
      .style('transform-origin', (d) => d.transformOrigin)
      .style('pointer-events', 'none')
  } else if (engine === 'canvas' && isCanvasContainer(container)) {
    configuredData.forEach((config) => {
      const text = new fabric.Text(config.value, {
        className: config.className,
        left: config.x,
        top: config.y,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        shadow: config.shadow,
        originY: 'bottom',
        selectable: false,
        evented: false,
      } as TextOptions)
      text.rotate(config.rotation)
      container.add(text)
    })
  }
}

const getShadow = (shadow: TextStyleShape['shadow']) => {
  if (isObject(shadow) && !isArray(shadow)) {
    const {color = '#000', offset = [0, 0], blur = 0, hide = false} = shadow
    if (!hide) {
      return `${offset[0]}px ${-offset[1]}px ${blur}px ${color}`
    }
    return ''
  }
  return shadow
}
