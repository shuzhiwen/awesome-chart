import {randomTable} from '../../../src'
import {LayerMatrixStyle} from '../../../src/types'
import {DemoLayersSchema} from '../base'

export default ({
  shape,
  brush,
}: {
  shape: LayerMatrixStyle['shape']
  brush?: boolean
}): DemoLayersSchema => [
  {
    type: 'text',
    data: '矩阵图',
  },
  {
    type: 'axis',
    scale: {
      paddingInner: 0,
    },
  },
  {
    type: 'matrix',
    data: randomTable({
      mode: 'normal',
      row: 8,
      column: 8,
      mu: 1000,
      sigma: 400,
    }),
    scale: {
      paddingInner: 0,
    },
    style: {
      shape,
      circleSize: ['auto', 'auto'],
      text: {
        hidden: true,
      },
    },
    animation: (theme) => ({
      rect: {
        enter: {
          ...theme.animation.presets.zoomIn,
          stagger: 10,
        },
      },
      circle: {
        enter: {
          ...theme.animation.presets.zoomIn,
          stagger: 10,
        },
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    }),
  },
  brush && {
    type: 'brush',
    options: {
      layout: 'brush',
    },
    style: {
      targets: ['scaleColor'],
    },
  },
]
