import {randomTable} from '../../../src'
import {DemoLayersSchema} from '../base'

export default (): DemoLayersSchema => [
  {
    type: 'text',
    data: '和弦图',
  },
  {
    type: 'chord',
    data: randomTable({
      mode: 'poisson',
      row: 10,
      column: 10,
      lambda: 40,
      mu: 1000,
      sigma: 400,
      decimals: 1,
    }),
    style: {
      labelOffset: 10,
    },
  },
]
