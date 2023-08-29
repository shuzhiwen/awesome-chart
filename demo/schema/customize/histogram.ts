import {group, randomNormal} from 'd3'
import {LayerRectStyle} from 'awesome-chart/dist/types'

const originValues = new Array(30)
  .fill(null)
  .map(() => randomNormal(10, 3)())
  .sort((a, b) => a - b)
const transformedData = [['区间', '数量'] as Meta[]].concat(
  Array.from(
    group(
      originValues,
      (v) => `${Math.floor(v / 2) * 2}-${Math.ceil(v / 2) * 2}`
    )
  ).map(([category, values]) => [category, values.length])
)

export default ({variant}: Partial<LayerRectStyle>) => [
  {
    type: 'text',
    data: '直方图模拟',
  },
  {
    type: 'legend',
  },
  {
    type: 'axis',
    scale: {
      zero: true,
      paddingInner: 0,
    },
  },
  {
    type: 'rect',
    data: transformedData,
    style: {
      variant,
      labelPosition: variant === 'column' ? 'top' : 'right',
      background: {
        fill: 'gray',
        fillOpacity: 0.3,
      },
      text: {
        fontSize: 10,
      },
    },
  },
  {
    type: 'auxiliary',
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
    },
  },
]
