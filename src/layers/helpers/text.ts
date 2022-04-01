import {isArray} from 'lodash'
import {formatNumber, getAttr, getTextWidth} from '../../utils'
import {CreateTextProps} from '../../types'

export function createText(props: CreateTextProps) {
  const {x, y, value, style = {}, position = 'right-top', offset = 0} = props,
    {fontSize: _fontSize = 12, writingMode, format} = style,
    fontSize = getAttr(_fontSize, 0, 12),
    formattedText = String(formatNumber(value, format)),
    textWidth = getTextWidth(formattedText, fontSize)
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
  } else if (position === 'left-top') {
    positionX -= textWidth + offset
    positionY -= offset
  } else if (position === 'right-top') {
    positionX += offset
    positionY -= offset
  } else if (position === 'left-bottom') {
    positionX -= textWidth + offset
    positionY += fontSize + offset
  } else if (position === 'right-bottom') {
    positionX += offset
    positionY += fontSize + offset
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
  const {angle} = props

  return createText({
    ...props,
    position:
      angle === 0
        ? 'top'
        : angle === 180
        ? 'bottom'
        : angle > 180
        ? 'left'
        : angle < 180
        ? 'right'
        : 'center',
  })
}
