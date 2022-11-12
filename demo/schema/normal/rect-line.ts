export default () =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '折线柱状图',
    },
    {
      type: 'legend',
      options: {
        layout: 'container',
      },
      style: {
        maxColumn: 2,
      },
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
      },
      scale: {
        count: 5,
        zero: true,
        paddingInner: 0.382,
      },
    },
    {
      type: 'rect',
      options: {
        layout: 'main',
        axis: 'main',
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
        labelPosition: 'top',
        background: {
          fill: 'gray',
          fillOpacity: 0.3,
        },
        text: {
          fontSize: 10,
        },
      },
      animation: (theme) => ({
        rect: {
          enter: theme.animation.presets.zoomIn,
          loop: theme.animation.presets.scanTop,
        },
        text: {
          enter: theme.animation.presets.fadeIn,
        },
      }),
    },
    {
      type: 'line',
      options: {
        layout: 'main',
        axis: 'minor',
        mode: 'stack',
      },
      data: {
        type: 'tableList',
        mode: 'normal',
        row: 5,
        column: 2,
        mu: -500,
        sigma: 200,
      },
      style: {
        fallback: 'break',
        labelPosition: 'top',
        curve: {
          strokeWidth: 2,
        },
        area: {
          hidden: true,
          fillOpacity: 0.5,
        },
        text: {
          fontSize: 10,
        },
      },
      animation: (theme) => ({
        curve: {
          enter: theme.animation.presets.eraseRight,
          loop: theme.animation.presets.scanRight,
        },
        area: {
          enter: theme.animation.presets.eraseRight,
          loop: theme.animation.presets.scanRight,
        },
        text: {
          enter: theme.animation.presets.fadeIn,
        },
      }),
    },
  ].filter(Boolean)
