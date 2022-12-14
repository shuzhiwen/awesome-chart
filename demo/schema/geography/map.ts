export default () => [
  {
    type: 'text',
    data: '二维地图',
  },
  {
    type: 'axis',
    options: {
      coordinate: 'geographic',
    },
  },
  {
    type: 'basemap',
    data: 100000,
    style: {
      block: {
        fill: 'skyblue',
      },
    },
  },
  {
    type: 'heatmap',
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
    type: 'scatter',
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
      point: {
        fill: 'rgb(238, 52, 161)',
        fillOpacity: 0.7,
      },
    },
  },
  {
    type: 'odLine',
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
        fillOpacity: 0.6,
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
]
