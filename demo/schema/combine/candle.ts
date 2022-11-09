import data from '../../../public/stock.json'

export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: 'K线图',
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
      count: 5,
      paddingInner: 0.382,
    },
    style: {
      maxScaleXTextNumber: 'auto',
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
