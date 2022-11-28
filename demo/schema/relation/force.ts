export default () => [
  {
    type: 'text',
    data: '重力气泡图',
  },
  {
    type: 'force',
    options: {
      zoom: true,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 10,
      column: 1,
      mu: 500,
      sigma: 200,
    },
    style: {},
    animation: {
      node: {
        updateAnimation: {
          duration: 0,
        },
      },
    },
  },
]
