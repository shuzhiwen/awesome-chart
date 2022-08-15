export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '重力气泡图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'force',
    options: {
      layout: 'main',
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
