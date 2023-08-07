import {isString, merge} from 'lodash'
import {Graphics} from 'pixi.js'
import {svgEasing} from '../animation'
import {selector} from '../layers'
import {PolyDrawerProps} from '../types'
import {getAttr, isCC, isSC, noChange, splitAlpha} from '../utils'

export function drawPolygon({
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
}: PolyDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    fill: getAttr(fill, i, graph.fill),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    fillOpacity: getAttr(fillOpacity, i, graph.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    pointString: item.points.reduce((prev, cur) => `${prev} ${cur.x},${cur.y}`, ''),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, {}),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('polygon')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('points', (d) => d.pointString)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('transform-origin', (d) => `${d.centerX} ${d.centerY}`)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
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

      isString(d.stroke)
        ? graphics.lineStyle(d.strokeWidth, ...splitAlpha(d.stroke, d.strokeOpacity))
        : graphics.lineTextureStyle({texture: d.stroke, width: d.strokeWidth})
      isString(d.fill)
        ? graphics.beginFill(...splitAlpha(d.fill, d.fillOpacity))
        : graphics.beginTextureFill({texture: d.fill})

      graphics.drawPolygon(d.points).endFill()
      container.addChild(graphics)
    })
  }
}
