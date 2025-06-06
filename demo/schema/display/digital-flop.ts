import {LayerFlopperStyle} from '../../../src/types'
import {DemoLayersSchema} from '../base'

export default ({
  variant,
}: {
  variant: LayerFlopperStyle['variant']
}): DemoLayersSchema => [
  {
    type: 'flopper',
    data: {
      value: 12034.456,
    },
    style: {
      variant,
      scale: 0.5,
      url: 'character.png',
      cell: {
        fontSize: '48px',
        backgroundColor: 'green',
      },
      characters: {
        0: {
          left: 0,
          top: 0,
          width: 54,
          height: 90,
        },
        1: {
          left: 54,
          top: 0,
          width: 54,
          height: 90,
        },
        2: {
          left: 108,
          top: 0,
          width: 54,
          height: 90,
        },
        3: {
          left: 162,
          top: 0,
          width: 54,
          height: 90,
        },
        ',': {
          left: 216,
          top: 0,
          width: 27,
          height: 90,
        },
        4: {
          left: 243,
          top: 0,
          width: 54,
          height: 90,
        },
        5: {
          left: 297,
          top: 0,
          width: 54,
          height: 90,
        },
        6: {
          left: 351,
          top: 0,
          width: 54,
          height: 90,
        },
        '.': {
          left: 405,
          top: 0,
          width: 27,
          height: 90,
        },
        7: {
          left: 432,
          top: 0,
          width: 54,
          height: 90,
        },
        8: {
          left: 486,
          top: 0,
          width: 54,
          height: 90,
        },
        9: {
          left: 540,
          top: 0,
          width: 54,
          height: 90,
        },
      },
    },
  },
]
