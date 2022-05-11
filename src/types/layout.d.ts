export interface LayoutArea {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export interface LayoutShape extends Record<string, LayoutArea> {
  main: LayoutArea
  container: LayoutArea
}

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
