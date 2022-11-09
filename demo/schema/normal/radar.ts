export default ({mode}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '饼图',
  },
  {
    type: 'legend',
    options: {
      layout: 'container',
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
  },
  {
    type: 'radar',
    options: {
      layout: 'main',
      axis: 'main',
      mode,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 5,
      column: 2,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
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
