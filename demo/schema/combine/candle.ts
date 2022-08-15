import data from '../../../assets/stock.json'

export default ({updateDuration = 0}: {updateDuration?: number}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: 'K线图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'legend',
    options: {
      layout: 'container',
    },
    style: {
      align: 'end',
      verticalAlign: 'start',
      direction: 'horizontal',
      pointSize: 8,
      gap: [5, 10],
      text: {
        fontSize: 12,
      },
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
    animation: {
      textY: {
        update: {
          delay: 0,
          duration: updateDuration,
        },
      },
    },
  },
  {
    type: 'candle',
    options: {
      layout: 'main',
      axis: 'main',
    },
    data,
    animation: {
      rect: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
        update: {
          delay: 0,
          duration: updateDuration,
        },
      },
      text: {
        update: {
          delay: 0,
          duration: updateDuration,
        },
      },
    },
    event: {
      'click-rect': (d) => console.log(d),
    },
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
