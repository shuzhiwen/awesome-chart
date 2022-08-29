export default () =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '柱状图',
      style: {
        text: {
          fontSize: 16,
        },
      },
    },
    {
      type: 'legend',
      options: {
        layout: 'container',
      },
      style: {
        align: 'end',
        verticalAlign: 'start',
        direction: 'horizontal',
        pointSize: 8,
        gap: [5, 10],
        text: {
          fontSize: 12,
        },
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
      style: {},
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
        row: 6,
        column: 3,
        mu: 500,
        sigma: 200,
        decimalPlace: 1,
      },
      style: {
        labelPosition: 'top',
        background: {
          fill: 'gray',
          fillOpacity: 0.3,
        },
        text: {
          fontSize: 10,
          format: {
            decimals: 2,
          },
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
          loop: {
            type: 'scan',
            delay: 0,
            duration: 5000,
            direction: 'top',
            opacity: 0.5,
          },
          update: {
            delay: 0,
            duration: 2000,
          },
        },
        text: {
          update: {
            delay: 0,
            duration: 2000,
          },
        },
      },
    },
    {
      type: 'line',
      options: {
        layout: 'main',
        axis: 'minor',
      },
      data: {
        type: 'tableList',
        mode: 'normal',
        row: 6,
        column: 3,
        mu: -500,
        sigma: 200,
        decimalPlace: 1,
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
        point: {},
      },
      animation: {
        curve: {
          enter: {
            type: 'erase',
            delay: 0,
            duration: 2000,
          },
          loop: {
            type: 'scan',
            delay: 0,
            duration: 5000,
            direction: 'right',
            opacity: 0.5,
            color: 'white',
          },
        },
        area: {
          enter: {
            type: 'erase',
            delay: 0,
            duration: 2000,
          },
          loop: {
            type: 'scan',
            delay: 0,
            duration: 5000,
            direction: 'right',
            opacity: 0.5,
            color: 'white',
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
  ].filter(Boolean)
