import {GetFacetLayoutCreatorProps, LayoutShape, LayoutProps} from '../types'

export const getFacetLayoutCreator =
  ({row, column}: GetFacetLayoutCreatorProps) =>
  ({containerWidth, containerHeight, padding}: LayoutProps): LayoutShape => {
    const layout: LayoutShape = {
      container: {
        top: 0,
        bottom: containerHeight,
        height: containerHeight,
        left: 0,
        right: containerWidth,
        width: containerWidth,
      },
      main: {
        top: padding[0],
        bottom: containerHeight - padding[2],
        height: containerHeight - padding[0] - padding[2],
        left: padding[3],
        right: containerWidth - padding[1],
        width: containerHeight - padding[1] - padding[3],
      },
    }

    const {top, bottom, left, right} = layout.main,
      facetWidth = (right - left) / column,
      facetHeight = (bottom - top) / row,
      rowGap = facetHeight / 20,
      columnGap = facetWidth / 20

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        layout[`facet${i * column + j}`] = {
          top: top + facetHeight * i + rowGap,
          bottom: top + facetHeight * (i + 1) - rowGap,
          height: facetHeight - 2 * rowGap,
          left: left + facetWidth * j + columnGap,
          right: left + facetWidth * (j + 1) - columnGap,
          width: facetWidth - 2 * columnGap,
        }
      }
    }

    return layout
  }
