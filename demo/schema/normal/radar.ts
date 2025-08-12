import {randomTableList} from '../../../src'
import {LayerRadarStyle} from '../../../src/types'
import {DemoLayersSchema} from '../base'

export default ({mode}: {mode: LayerRadarStyle['mode']}): DemoLayersSchema => [
  {
    type: 'text',
    data: '雷达图',
  },
  {
    type: 'legend',
  },
  {
    type: 'axis',
    style: {
      coordinate: 'polar',
    },
  },
  {
    type: 'radar',
    data: randomTableList({
      mode: 'normal',
      row: 5,
      column: 2,
      mu: 500,
      sigma: 200,
      abs: true,
    }),
    style: {
      mode,
      pointSize: 5,
      text: {
        hidden: true,
      },
    },
    animation: (theme) => ({
      polygon: {
        enter: theme.animation.presets.zoomIn,
        loop: theme.animation.presets.scanRight,
      },
      point: {
        enter: theme.animation.presets.fadeIn,
        loop: theme.animation.presets.breath,
      },
      text: {
        enter: theme.animation.presets.fadeIn,
      },
    }),
  },
]
