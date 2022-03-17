import {merge} from 'lodash'
import {dataMapping} from '../../data'
import {SCALE_TYPE} from '../../utils'
import {DataType, LayerScalesShape} from '../../types'

export function createScale<T extends Maybe<LayerScalesShape>>(
  defaultScale?: T,
  currentScale?: T,
  incomingScale?: T
) {
  const nice = merge({}, defaultScale?.nice, currentScale?.nice, incomingScale?.nice),
    scales: LayerScalesShape = {nice}

  SCALE_TYPE.forEach((type) => {
    scales[type] = incomingScale?.[type] || currentScale?.[type] || defaultScale?.[type]
  })

  return scales as Required<T>
}

export function validateAndCreateData<T>(
  dataType: DataType,
  currentData?: T,
  incomingData?: T,
  filter?: (data: T) => T
) {
  if (!incomingData) {
    return currentData
  } else if (!(incomingData instanceof dataMapping[dataType])) {
    throw new Error('require the right data processor')
  }

  return filter ? filter(incomingData) : incomingData
}

export function createStyle<T>(defaultStyle: T, currentStyle: T, incomingStyle: T) {
  return merge({}, defaultStyle, currentStyle, incomingStyle)
}
