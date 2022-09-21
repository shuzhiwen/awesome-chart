import {merge} from 'lodash'
import {dataMapping} from '../../data'
import {scaleTypes} from '../../utils'
import {DataType, LayerScale} from '../../types'

export function createScale<T extends Maybe<LayerScale>>(
  defaultScale?: T,
  currentScale?: T,
  incomingScale?: T
) {
  const nice = merge({}, defaultScale?.nice, currentScale?.nice, incomingScale?.nice),
    scales: LayerScale = {...currentScale, ...defaultScale, nice}

  scaleTypes.forEach((type) => {
    scales[type] = incomingScale?.[type] || defaultScale?.[type] || currentScale?.[type]
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

export function elClass(sublayer: string, dot: boolean) {
  return `${dot ? '.' : ''}chart-basic-${sublayer}`
}
