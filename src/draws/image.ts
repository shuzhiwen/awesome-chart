import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {IImageOptions} from 'fabric/fabric-impl'
import {ElConfigShape, ImageDrawerProps} from '../types'
import {getAttr, isCanvasCntr, isSvgCntr, noChange} from '../utils'
import {merge} from 'lodash'

export function drawImage({
  opacity,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
}: ImageDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    opacity: getAttr(opacity, i, graph.opacity),
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...(datum as ElConfigShape), container, theme}))
  })

  if (isSvgCntr(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('image')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('opacity', (d) => d.opacity)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('xlink:href', (d) => d.url)
  }

  if (isCanvasCntr(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
      fabric.Image.fromURL(
        config.url,
        (image) => {
          const scaleX = config.width / (image.width || 1),
            scaleY = config.height / (image.height || 1),
            minScale = Math.min(scaleX, scaleY)

          image.scaleX = minScale
          image.scaleY = minScale
          container.addWithUpdate(image)
          container.canvas?.requestRenderAll()
        },
        {
          className: config.className,
          left: config.x + config.width / 2,
          top: config.y + config.height / 2,
          opacity: config.opacity,
          source: config.source,
          originX: 'center',
          originY: 'center',
        } as IImageOptions
      )
    })
  }
}
