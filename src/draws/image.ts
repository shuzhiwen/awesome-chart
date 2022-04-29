import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {IImageOptions} from 'fabric/fabric-impl'
import {ImageDrawerProps} from '../types'
import {getAttr, isCanvasContainer, isSvgContainer, noChange} from '../utils'

export function drawImage({
  engine,
  opacity,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  ...rest
}: ImageDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...rest,
    ...item,
    className,
    opacity: getAttr(opacity, i, 1),
    source: getAttr(source, i, {}),
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('image')
      .attr('class', (d) => d.className)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .ease(svgEasing.get(transition?.easing)!)
      .attr('opacity', (d) => d.opacity)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('xlink:href', (d) => d.url)
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
      fabric.Image.fromURL(
        config.url,
        (image) => {
          image.scaleX = config.width / (image.width || 1)
          image.scaleY = config.height / (image.height || 1)
          container.addWithUpdate(image)
          container.canvas?.requestRenderAll()
        },
        {
          className: config.className,
          top: config.y,
          left: config.x,
          opacity: config.opacity,
          source: config.source,
        } as IImageOptions
      )
    })
  }

  return configuredData
}
