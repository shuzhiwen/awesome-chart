import {LayerGridStyle} from '../../../src/types'

export default (style: Pick<LayerGridStyle, 'placeMode'>) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '堆叠网格布局',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'grid',
    options: {
      layout: 'main',
    },
    data:
      style.placeMode === 'position'
        ? [
            ['width', 'height'],
            [1, 1],
            [2, 2],
            [3, 3],
            [8, 8],
          ]
        : [['width', 'height']].concat(new Array(20).fill([2, 2])),
    style: style,
    animation: {
      box: {
        enter: {
          type: 'zoom',
        },
        update: {
          duration: 200,
          delay: 0,
        },
      },
      placeholder: {
        update: {
          duration: 200,
          delay: 0,
        },
      },
    },
  },
]
