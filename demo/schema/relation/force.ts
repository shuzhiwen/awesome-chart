import {randomTableList} from '../../../src'

export default () => [
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
        updateAnimation: {
          duration: 0,
        },
      },
    },
  },
]
