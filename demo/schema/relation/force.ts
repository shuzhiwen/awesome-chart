import {randomTableList} from '../../../src'
import {DemoLayersSchema} from '../base'

export default (): DemoLayersSchema => [
  {
    type: 'text',
    data: '重力气泡图',
  },
  {
    type: 'force',
    data: randomTableList({
      mode: 'normal',
      row: 10,
      column: 1,
      mu: 500,
      sigma: 200,
    }),
    style: {
      zoom: true,
    },
    animation: {
      node: {
        update: {
          duration: 0,
        },
      },
    },
  },
]
