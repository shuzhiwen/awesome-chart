import {dynamicRawTableLists} from '../../debug/dynamic-rect'

export default () => [
  {
    type: 'text',
    data: '点击"UPDATE"开始播放',
  },
  {
    type: 'legend',
  },
  {
    type: 'axis',
    scale: {
      zero: true,
      fixedStep: 2000,
      fixedStart: 0,
    },
    style: {
      dynamicReserveTextX: true,
    },
    animation: {
      textY: {
        update: {
          duration: 500,
        },
      },
      textX: {
        update: {
          duration: 500,
        },
      },
      splitLineAxisX: {
        update: {
          duration: 500,
        },
      },
    },
  },
  {
    type: 'rect',
    options: {
      variant: 'bar',
      sort: 'desc',
    },
    data: dynamicRawTableLists[0],
    style: {
      labelPosition: 'right',
      background: {
        fill: 'gray',
        fillOpacity: 0.3,
      },
      text: {
        fontSize: 10,
      },
    },
    animation: `(theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              update: {duration: 500},
            },
            text: {
              enter: theme.animation.presets.fadeIn,
              update: {duration: 500},
            },
          })`,
  },
]
