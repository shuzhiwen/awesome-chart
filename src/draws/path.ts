import {isFunction, isString, merge} from 'lodash'
import {Graphics} from 'pixi.js'
import {svgEasing} from '../animation'
import {selector} from '../layers'
import {DrawerData, ElSource, PathDrawerProps} from '../types'
import {getAttr, isCC, isSC, noChange, parsePath, splitAlpha} from '../utils'

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
    path: movePath(item),
    centerX: item.centerX ?? 0,
    centerY: item.centerY ?? 0,
    fill: getAttr(fill, i, graph.fill),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    fillOpacity: getAttr(fillOpacity, i, graph.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, {} as ElSource),
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
      .attr('d', (d) => (isFunction(d.path) ? d.path() : d.path))
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
      .attr('transform-origin', (d) => `${d.centerX} ${d.centerY}`)
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
        ? graphics.lineStyle(
            d.strokeWidth,
            ...splitAlpha(d.stroke, d.strokeOpacity)
          )
        : graphics.lineTextureStyle({texture: d.stroke, width: d.strokeWidth})
      isString(d.fill)
        ? graphics.beginFill(...splitAlpha(d.fill, d.fillOpacity))
        : graphics.beginTextureFill({texture: d.fill})

      isFunction(d.path)
        ? d.path(graphics as unknown as CanvasRenderingContext2D)
        : graphics.drawPath(d.path)

      graphics.endFill()
      container.addChild(graphics)
    })
  }
}

export function movePath(props: DrawerData<PathDrawerProps>) {
  const {path, centerX = 0, centerY = 0} = props

  if (typeof path !== 'string') {
    return path
  }

  return parsePath(path)
    .map(({command, data}) => {
      if (command === 'M' || command === 'L') {
        data[0] += centerX
        data[1] += centerY
      } else if (command === 'H') {
        data[0] += centerX
      } else if (command === 'V') {
        data[0] += centerY
      } else if (command === 'C') {
        data[0] += centerX
        data[1] += centerY
        data[2] += centerX
        data[3] += centerY
        data[4] += centerX
        data[5] += centerY
      } else if (command === 'Q') {
        data[0] += centerX
        data[1] += centerY
        data[2] += centerX
        data[3] += centerY
      } else if (command === 'A') {
        data[5] += centerX
        data[6] += centerY
      }
      return `${command}${data.join(',')}`
    })
    .join('')
}
