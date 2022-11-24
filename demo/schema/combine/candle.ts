import data from '../../../public/stock.json'

export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '丐版K线',
  },
  {
    type: 'legend',
    options: {
      layout: 'container',
    },
  },
  {
    type: 'axis',
    options: {
      layout: 'main',
    },
    scale: {
      paddingInner: 0.1,
    },
  },
  {
    type: 'candle',
    options: {
      layout: 'main',
      axis: 'main',
    },
    data,
    animation: (theme) => ({
      rect: {
        enter: theme.animation.presets.zoomIn,
      },
    }),
  },
  {
    type: 'brush',
    options: {
      layout: 'brush',
    },
    style: {
      targets: ['scaleX'],
    },
  },
]
