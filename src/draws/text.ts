import {merge} from 'lodash'
import {interpolateNumber} from 'd3'
import {TextDrawerProps} from '../types'
import {getAttr, isSC, isCC, noChange, isRealNumber, mergeAlpha} from '../utils'
import {Text, TextStyleFontWeight} from 'pixi.js'
import {svgEasing} from '../animation'
import {selector} from '../layers'

export function drawText({
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
  writingMode,
  textDecoration,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
  evented,
}: TextDrawerProps) {
  const {
    text,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    centerX: item.x + item.textWidth / 2,
    centerY: item.y - item.textHeight / 2,
    fill: getAttr(fill, i, text.fill),
    stroke: getAttr(stroke, i, text.stroke),
    opacity: getAttr(opacity, i, text.opacity),
    fillOpacity: getAttr(fillOpacity, i, text.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, text.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, text.strokeWidth),
    shadow: getAttr(shadow, i, text.shadow),
    fontSize: getAttr(fontSize, i, text.fontSize),
    fontFamily: getAttr(fontFamily, i, text.fontFamily),
    fontWeight: getAttr(fontWeight, i, text.fontWeight),
    writingMode: getAttr(writingMode, i, 'horizontal-tb'),
    textDecoration: getAttr(textDecoration, i, 'none'),
    evented: getAttr(evented, i, text.evented),
    rotation: getAttr(rotation, i, 0),
    source: getAttr(source, i, []),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
    const prevTexts = container
      .selectAll(`.${className}`)
      .data()
      .map((d) => (d as typeof mappedData[number]).value)
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('text')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .textTween((d, i) => {
        const prevText = Number(prevTexts[i])
        const decimals = d.value.toString().split('.')[1]?.length || 0
        if (isRealNumber(Number(d.value)) && isRealNumber(prevText)) {
          return (t) => interpolateNumber(prevText, Number(d.value))(t).toFixed(decimals)
        }
        return () => d.value
      })
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - d.textHeight / 2)
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
      .attr('transform-origin', (d) => `${d.centerX} ${d.centerY}`)
      .attr('text-decoration', (d) => d.textDecoration)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
      .attr('transform', (d) => `rotate(${d.rotation})`)
      .style('text-shadow', (d) => d.shadow)
      .style('dominant-baseline', 'central')
  }

  if (isCC(container)) {
    container.removeChild(...selector.getChildren(container, className))
    mappedData.forEach((d) => {
      const text = new Text(d.value, {
        fontFamily: d.fontFamily,
        fontSize: d.fontSize,
        fontWeight: d.fontWeight as TextStyleFontWeight,
        fill: mergeAlpha(d.fill, d.fillOpacity),
        stroke: mergeAlpha(d.stroke, d.strokeOpacity),
        strokeThickness: d.strokeWidth,
      })
      text.alpha = d.opacity
      text.angle = d.rotation
      text.className = d.className
      text.interactive = d.evented
      text.pivot = {x: d.textWidth / 2, y: d.textHeight / 2}
      text.position = {x: d.x + d.textWidth / 2, y: d.y - d.textHeight / 2}
      text.cursor = d.evented ? 'pointer' : 'auto'
      container.addChild(text)
    })
  }
}
