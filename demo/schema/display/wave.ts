import {DemoLayersSchema} from '../base'

export default (): DemoLayersSchema => [
  {
    type: 'text',
    data: '水波球',
  },
  {
    type: 'wave',
    data: {
      value: 70,
      maxValue: 100,
    },
    style: {
      area: {
        fillOpacity: [0.5, 0.7],
        fill: ['rgb(51,204,204)', 'skyblue'],
      },
    },
    animation: {
      area: {
        loop: {
          type: 'move',
          duration: 50000,
          delay: 0,
          startOffset: [0, 0],
          endOffset: [300, 0],
          alternate: true,
          stagger: 100,
          decayFactor: 2,
        },
      },
    },
  },
]
