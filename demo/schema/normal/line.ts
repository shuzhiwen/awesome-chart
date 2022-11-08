export default ({mode, hasArea, curveType, hasMark = false}) =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '折线图',
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
      type: 'auxiliary',
      options: {
        layout: 'main',
        direction: 'horizontal',
      },
      data: [
        ['标签', '数值'],
        ['最大值', 300],
        ['最小值', 600],
      ],
      style: {
        labelPosition: 'right',
        line: {
          stroke: 'orange',
          strokeWidth: 2,
          dasharray: '10 5',
        },
        text: {
          fill: 'orange',
          fontSize: 8,
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
        zero: mode === 'stack' || hasMark,
      },
      style: {},
    },
    {
      type: 'line',
      options: {
        layout: 'main',
        axis: 'main',
        mode,
      },
      data: hasMark
        ? [
            ['年级', '人数'],
            ['1年级', 400],
            ['2年级', 200],
            ['3年级', 600],
            ['4年级', 100],
            ['5年级', 500],
          ]
        : {
            type: 'tableList',
            mode: 'normal',
            row: 5,
            column: 2,
            mu: 500,
            sigma: 200,
            decimalPlace: 1,
          },
      style: {
        fallback: 'break',
        labelPosition: hasMark ? 'bottom' : 'top',
        curveType,
        curve: {
          strokeWidth: 2,
        },
        area: {
          hidden: hasArea ? false : true,
          fillOpacity: 0.5,
        },
        text: {
          fontSize: 10,
          offset: hasMark ? [0, -5] : [0, 5],
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
    hasMark && {
      type: 'mark',
      options: {
        layout: 'main',
      },
      data: [
        ['x', 'y', 'value'],
        ['3年级', 600, '峰值'],
        ['4年级', 100, '谷值'],
      ],
      style: {
        mark: {
          fill: ['red', 'green'],
        },
      },
    },
  ].filter(Boolean)
