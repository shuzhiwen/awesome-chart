export default ({variant, stack = false, innerRadius, hasGuideLine = false}) => [
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
    style: {
      maxColumn: 3,
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
      row: 5,
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
      arc: {
        opacity: variant === 'pie' ? 1 : 0.7,
      },
      text: {
        hidden: variant !== 'pie',
      },
    },
    animation: (theme) => ({
      arc: {
        enter: theme.animation.presets.zoomIn,
      },
      guideLine: {
        enter: theme.animation.presets.fadeIn,
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    }),
  },
]
