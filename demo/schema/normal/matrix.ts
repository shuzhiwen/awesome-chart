export default ({shape}) => [
  {
    type: 'text',
    options: {
      id: 'title',
      layout: 'container',
    },
    data: '矩阵图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'axis',
    options: {
      id: 'axis',
      layout: 'main',
      type: 'cartesian',
    },
    scale: {
      count: 5,
      zero: false,
    },
    style: {},
  },
  {
    type: 'matrix',
    options: {
      id: 'matrix',
      layout: 'main',
      axis: 'main',
      shape,
    },
    data: {
      type: 'table',
      mode: 'normal',
      row: 8,
      column: 8,
      mu: 1000,
      sigma: 400,
      decimalPlace: 1,
    },
    scale: {
      paddingInner: 0,
    },
    style: {
      circleSize: ['auto', 'auto'],
      rect: {},
      text: {
        fontSize: 10,
      },
    },
    animation: {
      rect: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
      },
      circle: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
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
      'click-rect': (d) => console.log(d),
      'click-circle': (d) => console.log(d),
    },
  },
]
