export default ({mode, hasArea, curveType, hasMark = false}) =>
  [
    {
      type: 'text',
      data: '折线图',
    },
    {
      type: 'legend',
    },
    {
      type: 'axis',
      scale: {
        count: 5,
        zero: mode === 'stack' || hasMark,
      },
    },
    {
      type: 'line',
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
          },
      style: {
        mode,
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
      },
      animation: `(theme) => ({
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
      })`,
    },
    {
      type: 'auxiliary',
      data: [
        ['标签', '数值'],
        ['标准', 600],
        ['警戒', 300],
      ],
      style: {
        direction: 'horizontal',
        labelPosition: 'right',
        line: {
          stroke: ['orange', 'red'],
          strokeWidth: 2,
          dasharray: '10 5',
        },
      },
    },
    hasMark && {
      type: 'mark',
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
