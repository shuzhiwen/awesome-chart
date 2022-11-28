export default () =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '动画队列',
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
      },
      scale: {
        zero: true,
      },
    },
    {
      type: 'rect',
      options: {
        layout: 'main',
        axis: 'main',
      },
      data: [
        ['支出项', '数量'],
        ['房租', 1000],
        ['饮食', 1000],
        ['服装', 300],
        ['总计', 2300],
      ],
      animation: (theme) => ({
        rect: {
          enter: [theme.animation.presets.eraseRight, theme.animation.presets.zoomIn],
          loop: [
            theme.animation.presets.scanTop,
            theme.animation.presets.scanRight,
            theme.animation.presets.breath,
          ],
        },
        text: {
          enter: theme.animation.presets.fadeIn,
        },
      }),
    },
  ].filter(Boolean)
