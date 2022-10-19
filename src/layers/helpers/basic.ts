import {merge} from 'lodash'
import {dataMapping, DataTableList} from '../../data'
import {scaleTypes} from '../../utils'
import {DataType, LayerScale} from '../../types'

export function createScale<Scale extends Maybe<LayerScale>>(
  defaultScale?: Scale,
  currentScale?: Scale,
  incomingScale?: Scale
) {
  const nice = merge({}, defaultScale?.nice, currentScale?.nice, incomingScale?.nice),
    scales: LayerScale = {...currentScale, ...defaultScale, nice}

  scaleTypes.forEach((type) => {
    scales[type] = incomingScale?.[type] || defaultScale?.[type] || currentScale?.[type]
  })

  return scales as Required<Scale>
}

export function validateAndCreateData<LayerData>(
  dataType: DataType,
  currentData?: LayerData,
  incomingData?: LayerData,
  filter?: (data: LayerData) => LayerData | void
) {
  if (!incomingData) {
    return currentData
  } else if (!(incomingData instanceof dataMapping[dataType])) {
    throw new Error('require the right data processor')
  }

  return filter ? filter(incomingData) || incomingData : incomingData
}

export function createStyle<LayerStyle>(
  defaultStyle: LayerStyle,
  currentStyle: LayerStyle,
  incomingStyle: LayerStyle
) {
  return merge({}, defaultStyle, currentStyle, incomingStyle)
}

export function checkColumns(data: Maybe<DataTableList>, keys: Meta[]) {
  keys.map((key) => {
    if (!data?.headers.includes(key)) {
      throw new Error(`DataTableList lost specific column "${key}"`)
    }
  })
}

export function makeClass(sublayer: string, dot: boolean) {
  return `${dot ? '.' : ''}chart-basic-${sublayer}`
}
