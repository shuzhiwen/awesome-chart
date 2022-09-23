export interface LayoutCreator {
  (props: LayoutProps): Layout
}

export type LayoutArea = Readonly<{
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}>

export type Layout = Record<string, LayoutArea> &
  Readonly<{
    main: LayoutArea
    container: LayoutArea
  }>

export type LayoutProps = {
  containerWidth: number
  containerHeight: number
  padding: Padding
}

export type GetStandardLayoutCreatorProps = {
  brush: boolean
}

export type GetFacetLayoutCreatorProps = {
  row: number
  column: number
}
