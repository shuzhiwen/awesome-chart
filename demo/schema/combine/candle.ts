import data from '../../../public/stock.json'

export default () => [
  {
    type: 'text',
    data: '丐版K线',
  },
  {
    type: 'legend',
  },
  {
    type: 'axis',
    scale: {
      paddingInner: 0.1,
    },
  },
  {
    type: 'candle',
    data,
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
