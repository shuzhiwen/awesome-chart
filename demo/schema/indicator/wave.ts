export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '水波球',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'wave',
    options: {
      layout: 'main',
    },
    data: {
      value: 70,
      maxValue: 100,
    },
    style: {
      area: {
        fillOpacity: [0.4, 0.7],
      },
    },
    animation: {
      area: {
        loop: {
          type: 'move',
          duration: 10000,
          delay: 0,
          startOffset: [0, 0],
          endOffset: [200, 0],
          mode: 'alternate',
          stagger: 100,
          decayFactor: 2,
        },
      },
    },
  },
]
