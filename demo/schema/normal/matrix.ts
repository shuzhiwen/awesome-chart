export default ({shape, brush}: {shape: string; brush?: boolean}) =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '矩阵图',
      style: {
        text: {
          fontSize: 16,
        },
      },
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
        coordinate: 'cartesian',
      },
      scale: {
        count: 5,
        zero: false,
      },
      style: {},
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
        decimalPlace: 1,
      },
      scale: {
        paddingInner: 0,
      },
      style: {
        shape,
        circleSize: ['auto', 'auto'],
        rect: {},
        text: {
          fontSize: 10,
          hidden: true,
        },
      },
      animation: {
        rect: {
          enter: {
            type: 'zoom',
            delay: 0,
            duration: 2000,
            mode: 'enlarge',
            direction: 'both',
          },
        },
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
