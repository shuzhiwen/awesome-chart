import {isFunction, merge} from 'lodash'
import {DataBase, dataMapping, DataTableList} from '../../data'
import {ChartContext, DataType, LayerScale, LayerStyle} from '../../types'
import {scaleTypes} from '../../utils'

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

export function validateAndCreateData<Data extends Maybe<DataBase<unknown>>>(
  dataType: DataType,
  currentData?: Data,
  incomingData?: Data,
  filter?: (data: Data) => Data | void
) {
  if (!incomingData) {
    return currentData
  } else if (!(incomingData instanceof dataMapping[dataType])) {
    throw new Error('require the right data processor')
  }

  return filter ? filter(incomingData) || incomingData : incomingData
}

export function createStyle<Style extends Maybe<AnyObject>>(
  options: ChartContext,
  defaultStyle: LayerStyle<Style>,
  currentStyle: LayerStyle<Style>,
  incomingStyle: LayerStyle<Style>
) {
  const {theme} = options,
    _default = isFunction(defaultStyle) ? defaultStyle(theme) : defaultStyle,
    _current = isFunction(currentStyle) ? currentStyle(theme) : currentStyle,
    _incoming = isFunction(incomingStyle) ? incomingStyle(theme) : incomingStyle

  return merge({}, _default, _current, _incoming)
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
