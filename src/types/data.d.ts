import {DataDict} from '../data'
import {ColorMatrix} from '../utils'

export type DataType = Keys<DataDict>

export type LegendCache = {
  /**
   * @see LegendData.filter
   */
  type: 'row' | 'column'
  /**
   * @see LegendData.colorMatrix
   */
  colorMatrix: ColorMatrix
  /**
   * The key of the map is the key of a column or a row in `TableList`.
   * The number of cached colors is usually the same as the layer is.
   */
  mapping: Record<Meta, number>
}

export type DataBaseOptions = Partial<{order: LegendCache}>

export type TableListOptions = Partial<{
  /**
   * Select target corresponding to the rows and columns of `TableList`.
   */
  target: 'row' | 'column'
  /**
   * Select mode that decide how to generated a new `TableList`.
   */
  mode: 'sum' | 'percentage' | 'copy'
}>

export type TableOptions = Partial<{
  /**
   * Select target corresponding to the rows and columns of `Table`.
   */
  target: 'row' | 'column'
}>

/**
 * `RawTableList` can be seen as a relational table in the database.
 */
export type RawTableList<T = Meta> = T[][]

/**
 * `RawTable` can be seen as a matrix.
 */
export type RawTable<T = Meta> = [Meta[], Meta[], RawTableList<T>]

/**
 * `RawRelation` can be seen as two relational table in the database.
 * The first table is represents node information.
 * The second table is represents link information.
 */
export type RawRelation<T = Meta> = [RawTableList<T>, RawTableList<T>]

/**
 * Data structure of `TableList` item.
 */
export type TableListData = {
  /**
   * The key of the column.
   */
  header: Meta
  /**
   * The array of column value.
   */
  list: Meta[]
  /**
   * The minimum value of lists.
   */
  min?: Meta
  /**
   * The maximum value of lists.
   */
  max?: Meta
}[]

export type Edge = {
  /**
   * Unique edge ID.
   */
  id: Meta
  /**
   * The from node ID.
   */
  from: Meta
  /**
   * The end node ID.
   */
  to: Meta
  /**
   * The value representing the weight of edge.
   */
  value?: number
}

export type Node = {
  /**
   * Unique node ID.
   */
  id: Meta
  /**
   * The node name, usually unique.
   */
  name: Meta
  /**
   * The value representing the weight of node.
   */
  value?: number
  /**
   * Level represents the depth of a node in a directed acyclic graph.
   */
  level?: number
  /**
   * Parents are computed data according to link data.
   */
  parents?: Node[]
  /**
   * Children are computed data according to link data.
   */
  children?: Node[]
}

export type RelationData = {
  /**
   * Roots represent nodes in a directed acyclic graph that only have out-degrees.
   */
  roots: Meta[]
  /**
   * All nodes in the graph.
   */
  nodes: Node[]
  /**
   * All links in the graph.
   */
  edges: Edge[]
}

export type LegendData = {
  /**
   * Legend filter mode corresponding to the rows and columns of `TableList`.
   */
  filter: 'column' | 'row'
  /**
   * The current `ColorMatrix` of the layer.
   */
  colorMatrix: ColorMatrix
  /**
   * Legend data from the layer.
   */
  legends: {
    label: Meta
    color: string
    shape: LegendShape
  }[]
}

export type TooltipData = Maybe<{
  /**
   * Tooltip title that representing the dimension or category.
   */
  title?: Meta
  /**
   * Tooltip body data from all the layer.
   */
  list: Partial<{
    label: Meta
    value: Meta
    color: string
  }>[]
}>
