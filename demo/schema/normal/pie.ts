import {randomTableList} from '../../../src'

export default ({
  variant,
  stack = false,
  innerRadius,
  hasGuideLine = false,
}) => [
  {
    type: 'text',
    data: '饼图',
  },
  {
    type: 'legend',
    style: {
      maxColumn: 1,
      align: ['end', 'center'],
    },
  },
  {
    type: 'axis',
    scale: {
      paddingInner: variant !== 'pie' && stack ? 0.1 : 0,
    },
    style: {
      coordinate: 'polar',
      splitLineAngle: {hidden: variant === 'pie'},
      splitLineRadius: {hidden: variant === 'pie'},
      textAngle: {hidden: variant === 'pie'},
      textRadius: {hidden: variant === 'pie'},
    },
  },
  {
    type: 'arc',
    data: randomTableList({
      mode: 'normal',
      row: 5,
      column: stack ? 2 : 1,
      mu: 500,
      sigma: 200,
      abs: true,
    }),
    style: {
      variant,
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
    animation: `(theme) => ({
      arc: {
        enter: theme.animation.presets.zoomIn,
      },
      guideLine: {
        enter: theme.animation.presets.fadeIn,
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    })`,
  },
]
