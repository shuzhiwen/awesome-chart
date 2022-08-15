export default ({variant, mode, innerRadius}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
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
      coordinate: 'polar',
    },
    scale: {
      count: 5,
      zero: false,
    },
    style: {},
  },
  {
    type: 'arc',
    options: {
      layout: 'main',
      variant,
      mode,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 6,
      column: mode === 'stack' ? 2 : 1,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
    },
    style: {
      labelPosition: 'outer',
      innerRadius,
      text: {
        fontSize: 8,
        hidden: false,
      },
    },
    animation: {
      arc: {
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
  },
]
