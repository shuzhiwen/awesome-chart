export type LayoutArea = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export type LayoutShape = Record<string, LayoutArea>

export type LayoutCreator = (props: LayoutProps) => LayoutShape

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
