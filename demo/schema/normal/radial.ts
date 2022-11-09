export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '玉玦图',
  },
  {
    type: 'radial',
    options: {
      layout: 'main',
    },
    data: [
      ['指标', '当前', '目标'],
      ['体重', 69, 80],
      ['身高', 175, 185],
      ['运动时长', 18, 30],
      ['运动次数', 5, 10],
    ],
    animation: (theme) => ({
      arc: {
        enter: theme.animation.presets.zoomIn,
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    }),
  },
  {
    type: 'axis',
    options: {
      layout: 'main',
      coordinate: 'polar',
    },
    scale: {
      count: 0,
      fixedPaddingInner: 4,
    },
  },
]
