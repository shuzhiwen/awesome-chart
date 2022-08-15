export default ({mode, hasArea, curveType}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '折线图',
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
    type: 'auxiliary',
    options: {
      layout: 'main',
      direction: 'horizontal',
    },
    data: [
      ['标签', '数值'],
      ['最大值', 300],
      ['最小值', 600],
    ],
    style: {
      labelPosition: 'right',
      line: {
        stroke: 'yellow',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'yellow',
        fontSize: 8,
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
      zero: false,
    },
    style: {},
  },
  {
    type: 'line',
    options: {
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
      fallback: 'break',
      labelPosition: 'top',
      curveType,
      curve: {
        strokeWidth: 2,
      },
      area: {
        hidden: hasArea ? false : true,
        fillOpacity: 0.5,
      },
      text: {
        fontSize: 10,
      },
      point: {},
    },
    animation: {
      curve: {
        enter: {
          type: 'erase',
          delay: 0,
          duration: 2000,
        },
      },
      area: {
        enter: {
          type: 'erase',
          delay: 0,
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
  },
]
