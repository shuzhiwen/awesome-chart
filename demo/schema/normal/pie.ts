export default ({variant, stack = false, innerRadius, hasGuideLine = false}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '饼图',
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
      coordinate: 'polar',
    },
    scale: {
      count: 5,
      zero: false,
    },
    style: {
      splitLineAngle: {hidden: variant === 'pie'},
      splitLineRadius: {hidden: variant === 'pie'},
      textAngle: {hidden: variant === 'pie'},
      textRadius: {hidden: variant === 'pie'},
    },
  },
  {
    type: 'arc',
    options: {
      layout: 'main',
      variant,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 6,
      column: stack ? 2 : 1,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
    },
    style: {
      labelPosition: variant === 'pie' ? 'outer' : 'inner',
      labelOffset: hasGuideLine ? 15 : 5,
      innerRadius,
      guideLine: {
        hidden: !hasGuideLine,
      },
      text: {
        fontSize: 8,
        hidden: variant !== 'pie',
      },
    },
    animation: {
      arc: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
      },
      guideLine: {
        enter: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          mode: 'fadeIn',
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
]
