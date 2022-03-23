export interface LayoutArea {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export type LayoutShape = Record<string, LayoutArea>

export interface LayoutCreator {
  (props: LayoutProps): LayoutShape
}

export interface LayoutProps {
  containerWidth: number
  containerHeight: number
  padding: Padding
}

export interface GetStandardLayoutCreatorProps {
  brush: boolean
}

export interface GetFacetLayoutCreatorProps {
  row: number
  column: number
}
