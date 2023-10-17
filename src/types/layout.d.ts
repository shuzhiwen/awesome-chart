export interface LayoutCreator {
  (props: LayoutProps): Layout
}

/**
 * `LayoutArea` is a rectangle box in which chart layer placed.
 * Note that layers should not exceed the layout.
 */
type LayoutArea = Readonly<{
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}>

/**
 * The layout is divided into several layer areas,
 * and each layer is drawn in a specific area.
 */
type Layout = Record<string, LayoutArea> & {
  /**
   * Generally refers to the overall area of the chart.
   */
  main: LayoutArea
  /**
   * Generally refers to the overall area of the chart minus padding.
   */
  container: LayoutArea
}

type LayoutProps = {
  /**
   * The height of the chart box.
   */
  containerWidth: number
  /**
   * The height of the chart box.
   */
  containerHeight: number
  /**
   * The padding of the main drawing area.
   */
  padding: Padding
}

type GetStandardLayoutCreatorProps = {
  /**
   * Generate brush layout area or not.
   */
  brush: boolean
}

type GetFacetLayoutCreatorProps = {
  /**
   * Facet rows for layout area.
   */
  row: number
  /**
   * Facet columns for layout area.
   */
  column: number
  /**
   * Row and column spacing between each area.
   */
  gap: Vec2<Meta>
}
