export default ({shape, brush}: {shape: string; brush?: boolean}) =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '矩阵图',
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
        coordinate: 'cartesian',
      },
      scale: {
        paddingInner: 0,
      },
    },
    {
      type: 'matrix',
      options: {
        layout: 'main',
        axis: 'main',
      },
      data: {
        type: 'table',
        mode: 'normal',
        row: 8,
        column: 8,
        mu: 1000,
        sigma: 400,
      },
      scale: {
        paddingInner: 0,
      },
      style: {
        shape,
        circleSize: ['auto', 'auto'],
        text: {
          hidden: true,
        },
      },
      animation: (theme) => ({
        rect: {
          enter: theme.animation.presets.zoomIn,
        },
        circle: {
          enter: theme.animation.presets.zoomIn,
        },
        text: {
          enter: theme.animation.presets.fadeIn,
        },
      }),
    },
  ].concat(
    brush
      ? ([
          {
            type: 'brush',
            options: {
              layout: 'brush',
            },
            style: {
              targets: ['scaleColor'],
            },
          },
        ] as any)
      : []
  )
