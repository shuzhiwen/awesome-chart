import data from '../../../assets/stock.json'

export default ({updateDuration = 0}: {updateDuration?: number}) => [
  {
    type: 'text',
    options: {
      id: 'title',
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
      id: 'legend',
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
      id: 'axis',
      layout: 'main',
    },
    data: {
      titleX: 'titleX',
      titleY: 'titleY',
      titleYR: 'titleYR',
    },
    scale: {
      count: 5,
      paddingInner: 0.382,
      // fixedPaddingInner: 10,
      // fixedBandwidth: 30,
      // fixedBoundary: 'start',
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
        // loop: {
        //   type: 'scan',
        //   delay: 2000,
        //   duration: 3000,
        //   color: 'rgba(255,255,255,1)',
        //   direction: type === 'bar' ? 'right' : 'top',
        // },
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
