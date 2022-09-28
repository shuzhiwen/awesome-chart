export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '堆叠网格布局',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'grid',
    options: {
      layout: 'main',
    },
    data: [
      ['width', 'height'],
      [1, 1],
      [2, 2],
      [3, 3],
      [8, 8],
    ],
    style: {},
    animation: {
      box: {
        enter: {
          type: 'zoom',
        },
      },
    },
  },
]
