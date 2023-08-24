import {isFunction, merge} from 'lodash'
import {DataBase, DataDict, DataTableList} from '../../data'
import {ChartContext, DataType, LayerScale, LayerStyle} from '../../types'

/**
 * Integrate scales from different sources into the final scale.
 * @param defaultScale
 * Default scale means "new scale", has medium priority.
 * @param currentScale
 * Current scale means "old scale", has lowest priority.
 * @param incomingScale
 * Incoming scale means "new scale", has highest priority.
 * @returns
 * The final merged scale.
 */
export function createScale<Scale extends Maybe<LayerScale>>(
  defaultScale: Scale,
  currentScale: Scale,
  incomingScale?: Scale
) {
  return {
    ...currentScale,
    ...defaultScale,
    ...incomingScale,
    nice: merge(
      {},
      defaultScale?.nice,
      currentScale?.nice,
      incomingScale?.nice
    ),
  }
}

/**
 * Check if the data type meets the layer requirements.
 * @param dataType
 * Only subclasses that inherit from the `DataBase` class are valid data sources.
 * @param currentData
 * Current data means "old data", has lowest priority.
 * @param incomingData
 * Incoming data means "new data", has highest priority.
 * @param filter
 * Just a callback method.
 * @returns
 */
export function createData<Data extends Maybe<DataBase<unknown>>>(
  dataType: DataType,
  currentData: Data,
  incomingData: Data,
  filter?: (data: Data) => Data | void
) {
  if (!incomingData) {
    return currentData
  } else if (!(incomingData instanceof DataDict[dataType])) {
    throw new Error('require the right data processor')
  }

  return filter ? filter(incomingData) || incomingData : incomingData
}

/**
 * Integrate styles from different sources into the final style.
 * @param context
 * Theme from chart context will be used to generate style.
 * @param defaultStyle
 * Default style means "new style", has medium priority.
 * @param currentStyle
 * Current style means "old style", has lowest priority.
 * @param incomingStyle
 * Incoming style means "new style", has highest priority.
 * @returns
 * The final merged style.
 */
export function createStyle<Style extends Maybe<AnyObject>>(
  context: ChartContext,
  defaultStyle: Style,
  currentStyle: Style,
  incomingStyle: LayerStyle<Style>
): Style {
  const {theme} = context,
    _default = isFunction(defaultStyle) ? defaultStyle(theme) : defaultStyle,
    _current = isFunction(currentStyle) ? currentStyle(theme) : currentStyle,
    _incoming = isFunction(incomingStyle) ? incomingStyle(theme) : incomingStyle

  return merge({}, _default, _current, _incoming)
}

/**
 * Check if TableList has a specific columns.
 * @param data
 * The `TableList` to check.
 * @param keys
 * The headers that the tableList must have.
 * @throw
 * Throw `Error` when tableList lack of specific header.
 */
export function checkColumns(data: Maybe<DataTableList>, keys: Meta[]) {
  keys.map((key) => {
    if (!data?.headers.includes(key)) {
      throw new Error(`DataTableList lost specific column "${key}"`)
    }
  })
}

/**
 * Generates the class name of the base element.
 * @param sublayer
 * The sublayer tags that the elements have.
 * @returns
 * Selectable `className` for basic element.
 */
export function elClass(sublayer: string) {
  return `element-basic-${sublayer}`
}
