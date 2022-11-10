import {LayerRectOptions} from '../../../src/types'
import {group, randomNormal} from 'd3'

const originValues = new Array(30)
  .fill(null)
  .map(() => randomNormal(10, 3)())
  .sort((a, b) => a - b)
const transformedData = [['区间', '数量'] as Meta[]].concat(
  Array.from(group(originValues, (v) => `${Math.floor(v / 2) * 2}-${Math.ceil(v / 2) * 2}`)).map(
    ([category, values]) => [category, values.length]
  )
)

export default ({variant}: Partial<LayerRectOptions>) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '直方图模拟',
  },
  {
    type: 'legend',
    options: {
      layout: 'container',
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
      paddingInner: 0,
    },
  },
  {
    type: 'rect',
    options: {
      layout: 'main',
      axis: 'main',
      variant,
    },
    data: transformedData,
    style: {
      labelPosition: variant === 'column' ? 'top' : 'right',
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
  },
  {
    type: 'auxiliary',
    options: {
      layout: 'main',
    },
    data: [
      ['标签', '数值'],
      ['达标', 6],
      ['未达标', 2],
    ],
    style: {
      direction: variant === 'column' ? 'horizontal' : 'vertical',
      labelPosition: variant === 'column' ? 'right' : 'top',
      line: {
        stroke: ['orange', 'red'],
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: ['orange', 'red'],
      },
    },
  },
]
