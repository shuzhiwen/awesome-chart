export default () => [
  {
    type: 'text',
    options: {
      id: 'title',
      layout: 'container',
    },
    data: '二维地图',
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
      layout: 'container',
      coordinate: 'geographic',
    },
    style: {},
  },
  {
    type: 'basemap',
    options: {
      id: 'basemap',
      layout: 'container',
    },
    data: 100000,
    style: {
      block: {
        fill: 'skyblue',
      },
      text: {
        shadow: {
          blur: 4,
        },
      },
    },
    event: {
      'click-block': (d) => console.log(d),
    },
  },
  {
    type: 'heatmap',
    options: {
      id: 'heatmap',
      layout: 'container',
    },
    data: [
      ['x', 'y', 'value'],
      [100, 30, 10],
      [115, 25, 20],
      [120, 20, 30],
      [110, 35, 40],
      [110, 25, 50],
    ],
    style: {},
  },
  {
    type: 'odLine',
    options: {
      id: 'odLine',
      layout: 'container',
    },
    data: [
      ['fromX', 'fromY', 'toX', 'toY'],
      [120, 30, 90, 45],
    ],
    style: {
      odLine: {
        stroke: 'yellow',
      },
      flyingObject: {
        fill: 'yellow',
        path: 'm-16.113639,0.075168c0,29.080622 37.728806,0 37.224786,-0.075171c0.50402,0.075171 -37.224786,-29.005451 -37.224786,0.075171z',
      },
    },
  },
  {
    type: 'scatter',
    options: {
      id: 'scatter',
      layout: 'container',
      axis: 'main',
    },
    data: [
      ['category', 'x', 'y'],
      ['沈阳', 123.429092, 41.796768],
      ['杭州', 120.15358, 30.287458],
      ['北京', 116.405289, 39.904987],
      ['上海', 121.472641, 31.231707],
    ],
    style: {
      circleSize: [10, 10],
      text: {
        hidden: true,
        fontSize: 10,
      },
    },
    animation: {
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
      'click-circle': (d) => console.log(d),
    },
  },
]
