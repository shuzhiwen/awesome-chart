import {fabric} from 'fabric'
import {IImageOptions} from 'fabric/fabric-impl'
import {ImageDrawerProps} from '../types'
import {getAttr, isCanvasContainer, isSvgContainer, noChange} from '../utils'

export function drawImage({
  engine,
  opacity,
  enableUpdateAnimation = false,
  updateAnimationDuration = 2000,
  updateAnimationDelay = 0,
  mapping = noChange,
  source = [],
  data = [],
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
      .duration(enableUpdateAnimation ? updateAnimationDuration : 0)
      .delay(enableUpdateAnimation ? updateAnimationDelay : 0)
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
          selectable: false,
        } as IImageOptions
      )
    })
  }

  return configuredData
}
