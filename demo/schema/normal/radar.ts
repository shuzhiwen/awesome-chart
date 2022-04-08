export default ({mode}) => [
  {
    type: 'text',
    options: {
      id: 'title',
      layout: 'title',
    },
    data: '饼图',
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
      layout: 'legend',
    },
    style: {
      align: 'end',
      verticalAlign: 'start',
      direction: 'horizontal',
      pointSize: 8,
      gap: [5, 10],
      text: {
        fontSize: 12,
        // fill: 'red',
      },
    },
  },
  {
    type: 'axis',
    options: {
      id: 'axis',
      layout: 'main',
      type: 'polar',
    },
    scale: {
      count: 5,
      zero: false,
    },
    style: {},
  },
  {
    type: 'radar',
    options: {
      id: 'radar',
      layout: 'main',
      axis: 'main',
      mode,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 6,
      column: 3,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
    },
    style: {
      pointSize: 5,
      text: {
        fontSize: 10,
      },
    },
    animation: {
      polygon: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
        loop: {
          type: 'scan',
          delay: 1000,
          duration: 3000,
          color: 'rgba(255,255,255,0.5)',
          direction: 'outer',
        },
      },
      circle: {
        enter: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          mode: 'fadeIn',
        },
        loop: {
          type: 'breathe',
          delay: 1000,
          duration: 2000,
        },
      },
      text: {
        enter: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          mode: 'fadeIn',
        },
      },
    },
    event: {
      'click-circle': (d) => console.log(d),
    },
  },
]
