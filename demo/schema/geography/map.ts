export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '二维地图',
  },
  {
    type: 'axis',
    options: {
      layout: 'container',
      coordinate: 'geographic',
    },
  },
  {
    type: 'basemap',
    options: {
      layout: 'container',
    },
    data: 100000,
    style: {
      block: {
        fill: 'skyblue',
      },
    },
  },
  {
    type: 'heatmap',
    options: {
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
  },
  {
    type: 'odLine',
    options: {
      layout: 'container',
    },
    data: [
      ['fromX', 'fromY', 'toX', 'toY'],
      [120, 30, 90, 45],
    ],
    style: {
      odLine: {
        stroke: 'orange',
      },
      flyingObject: {
        fill: 'orange',
        path: 'm-16.113639,0.075168c0,29.080622 37.728806,0 37.224786,-0.075171c0.50402,0.075171 -37.224786,-29.005451 -37.224786,0.075171z',
      },
    },
    animation: {
      flyingObject: {
        loop: {
          type: 'path',
        },
      },
    },
  },
  {
    type: 'scatter',
    options: {
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
      },
    },
    animation: (theme) => ({
      circle: {
        enter: theme.animation.presets.zoomIn,
      },
    }),
  },
]
