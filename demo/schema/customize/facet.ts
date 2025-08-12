import {randomTableList, themeColors} from '../../../src'
import {ChartTheme} from '../../../src/types'
import {DemoLayersSchema} from '../base'

const data = randomTableList({
  mode: 'normal',
  row: 5,
  column: 1,
  mu: 500,
  sigma: 200,
  abs: true,
})

const animation = (theme: ChartTheme) => ({
  arc: {
    enter: theme.animation.presets.zoomIn,
  },
  guideLine: {
    enter: theme.animation.presets.fadeIn,
  },
  text: {
    enter: theme.animation.presets.fadeIn,
  },
})

export default (): DemoLayersSchema => [
  {
    type: 'text',
    data: '分面饼图',
  },
  {
    type: 'legend',
    style: {
      maxColumn: 2,
      align: ['end', 'center'],
    },
  },
  {
    type: 'axis',
  },
  {
    type: 'arc',
    options: {
      layout: 'facet0',
    },
    data,
    style: {
      labelPosition: 'outer',
      labelOffset: 5,
      innerRadius: 0,
      guideLine: {
        hidden: true,
      },
      arc: {
        fill: themeColors.duskUniverse.slice(0, 4),
      },
    },
    animation,
  },
  {
    type: 'arc',
    options: {
      layout: 'facet1',
    },
    data,
    style: {
      labelPosition: 'inner',
      labelOffset: 0,
      innerRadius: 0,
      guideLine: {
        hidden: true,
      },
      arc: {
        fill: themeColors.emeraldGreen.slice(2, 6),
      },
    },
    animation,
  },
  {
    type: 'arc',
    options: {
      layout: 'facet2',
    },
    data,
    style: {
      labelPosition: 'outer',
      labelOffset: 5,
      innerRadius: 10,
      guideLine: {
        hidden: true,
      },
      arc: {
        fill: themeColors.exquisite.slice(4, 8),
      },
    },
    animation,
  },
  {
    type: 'arc',
    options: {
      layout: 'facet3',
    },
    data,
    style: {
      labelPosition: 'inner',
      labelOffset: 0,
      innerRadius: 10,
      guideLine: {
        hidden: true,
      },
      arc: {
        fill: themeColors.fairyLand.slice(6, 10),
      },
    },
    animation,
  },
]
