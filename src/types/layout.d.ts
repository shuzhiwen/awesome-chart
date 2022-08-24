export interface LayoutCreator {
  (props: LayoutProps): LayoutShape
}

export type LayoutArea = Readonly<{
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}>

export type LayoutShape = Record<string, LayoutArea> & {
  readonly main: LayoutArea
  readonly container: LayoutArea
}

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
