import {randomTableList} from '../../../src'
import {LayerArcStyle} from '../../../src/types'
import {DemoLayersSchema} from '../base'

export default ({
  variant,
  innerRadius,
  hasGuideLine = false,
  stack = false,
}: {
  variant: LayerArcStyle['variant']
  innerRadius: number
  hasGuideLine?: boolean
  stack?: boolean
}): DemoLayersSchema => [
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
