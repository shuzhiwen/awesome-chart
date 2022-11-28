export default ({mode}) => [
  {
    type: 'text',
    data: '雷达图',
  },
  {
    type: 'legend',
  },
  {
    type: 'axis',
    options: {
      coordinate: 'polar',
    },
  },
  {
    type: 'radar',
    options: {
      mode,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 5,
      column: 2,
      mu: 500,
      sigma: 200,
    },
    style: {
      pointSize: 5,
      text: {
        hidden: true,
      },
    },
    animation: (theme) => ({
      polygon: {
        enter: theme.animation.presets.zoomIn,
        loop: theme.animation.presets.scanOut,
      },
      point: {
        enter: theme.animation.presets.fadeIn,
        loop: theme.animation.presets.breath,
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    }),
  },
]
