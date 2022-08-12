import {isArray, merge} from 'lodash'
import {formatNumber, getAttr, getTextWidth, isApproximateNumber} from '../../utils'
import {CreateLimitTextProps, CreateTextProps} from '../../types'

export function createText(props: CreateTextProps) {
  const {x, y, value, style = {}, position = 'rightTop', offset = 0} = props,
    {fontSize: _fontSize, writingMode, format} = style,
    fontSize = getAttr(_fontSize, 0, 12),
    formattedText = String(formatNumber(value, format)),
    textWidth = getTextWidth(formattedText, fontSize),
    arcOffset = offset / Math.SQRT2
  let [positionX, positionY] = [x, y]

  if (position === 'center') {
    positionX -= textWidth / 2
    positionY += fontSize / 2
  } else if (position === 'left') {
    positionX -= textWidth + offset
    positionY += fontSize / 2
  } else if (position === 'right') {
    positionX += offset
    positionY += fontSize / 2
  } else if (position === 'top') {
    positionX -= textWidth / 2
    positionY -= offset
  } else if (position === 'bottom') {
    positionX -= textWidth / 2
    positionY += fontSize + offset
  } else if (position === 'leftTop') {
    positionX -= textWidth + arcOffset
    positionY -= arcOffset
  } else if (position === 'rightTop') {
    positionX += arcOffset
    positionY -= arcOffset
  } else if (position === 'leftBottom') {
    positionX -= textWidth + arcOffset
    positionY += fontSize + arcOffset
  } else if (position === 'rightBottom') {
    positionX += arcOffset
    positionY += fontSize + arcOffset
  }

  if (writingMode === 'vertical-rl') {
    positionX += textWidth / 2
    positionY += -fontSize
  }

  if (isArray(style.offset)) {
    positionX += style.offset[0]
    positionY -= style.offset[1]
  }

  return {
    x: positionX,
    y: positionY,
    value: formattedText,
    // corresponding to drawer
    transformOrigin: `${positionX + textWidth / 2}px ${y}px`,
    textWidth,
  }
}

export function createArcText(props: Omit<CreateTextProps, 'position'> & {angle: number}) {
  let angle = props.angle % (Math.PI * 2)

  while (angle < 0) angle += Math.PI * 2

  return createText({
    ...props,
    position: isApproximateNumber(angle, 0)
      ? 'top'
      : isApproximateNumber(angle, Math.PI)
      ? 'bottom'
      : angle < Math.PI
      ? angle < Math.PI * 0.5
        ? 'rightTop'
        : 'rightBottom'
      : angle > Math.PI
      ? angle > Math.PI * 1.5
        ? 'leftTop'
        : 'leftBottom'
      : 'center',
  })
}

export function createLimitText(props: CreateLimitTextProps) {
  const {value, style = {}, maxTextWidth} = props,
    {fontSize: _fontSize, format} = style,
    formattedText = String(formatNumber(value, format))
  let fontSize = getAttr(_fontSize, 0, 12)

  while (getTextWidth(formattedText, fontSize) > maxTextWidth) {
    --fontSize
  }

  return {...createText(merge(props, {style: {fontSize}})), fontSize}
}
