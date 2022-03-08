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
    transformOrigin: `${positionX + textWidth / 2}px ${y - fontSize / 2}px`,
    textWidth,
  }
}
