import {GetStandardLayoutCreatorProps, LayoutShape, LayoutProps} from '../types'

export const getStandardLayoutCreator =
  ({brush}: GetStandardLayoutCreatorProps) =>
  ({containerWidth, containerHeight, padding}: LayoutProps): LayoutShape => {
    const brushHeight = brush ? containerHeight / 10 : 0
    const heightWithoutBrush = containerHeight - brushHeight

    return {
      title: {
        top: 0,
        bottom: heightWithoutBrush,
        height: heightWithoutBrush,
        left: 0,
        right: containerWidth,
        width: containerWidth,
      },
      unit: {
        top: 0,
        bottom: heightWithoutBrush,
        height: heightWithoutBrush,
        left: 0,
        right: containerWidth,
        width: containerWidth,
      },
      legend: {
        top: 0,
        bottom: heightWithoutBrush,
        height: heightWithoutBrush,
        left: 0,
        right: containerWidth,
        width: containerWidth,
      },
      main: {
        top: padding[0],
        bottom: heightWithoutBrush - padding[2],
        height: heightWithoutBrush - padding[0] - padding[2],
        left: padding[3],
        right: containerWidth - padding[1],
        width: containerWidth - padding[1] - padding[3],
      },
      brush: {
        top: heightWithoutBrush,
        bottom: containerHeight,
        height: containerHeight - heightWithoutBrush,
        left: padding[3],
        right: containerWidth - padding[1],
        width: containerWidth - padding[1] - padding[3],
      },
    }
  }
