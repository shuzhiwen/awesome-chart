import {LayerRectOptions} from '../../../src/types'

export default ({
  mode,
  variant,
  sort,
  updateDuration = 2000,
}: Partial<LayerRectOptions> & {updateDuration?: number}) => [
  {
    type: 'text',
    options: {
      id: 'title',
      layout: 'container',
    },
    data: '柱状图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'legend',
    options: {
      id: 'legend',
      layout: 'container',
    },
    style: {
      align: 'end',
      verticalAlign: 'start',
      direction: 'horizontal',
      pointSize: 8,
      gap: [5, 10],
      text: {
        fontSize: 12,
      },
    },
  },
  {
    type: 'auxiliary',
    options: {
      id: 'auxiliary',
      layout: 'main',
    },
    data: [
      ['标签', '数值'],
      ['最大值', 300],
      ['最小值', 600],
    ],
    style: {
      direction: variant === 'column' ? 'horizontal' : 'vertical',
      labelPosition: 'right',
      line: {
        stroke: 'yellow',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'yellow',
        fontSize: 8,
      },
    },
  },
  {
    type: 'axis',
    options: {
      id: 'axis',
      layout: 'main',
    },
    data: {
      titleX: 'titleX',
      titleY: 'titleY',
      titleYR: 'titleYR',
    },
    scale: {
      count: 5,
      zero: true,
      paddingInner: 0.382,
      // fixedPaddingInner: 10,
      // fixedBandwidth: 30,
      // fixedBoundary: 'start',
    },
    style: {},
    animation: {
      textY: {
        update: {
          delay: 0,
          duration: updateDuration,
        },
      },
    },
  },
  {
    type: 'rect',
    options: {
      id: 'rect',
      layout: 'main',
      axis: 'main',
      mode,
      variant,
      sort,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 6,
      column: 3,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
    },
    style: {
      labelPosition: mode === 'group' ? (variant === 'column' ? 'top' : 'right') : 'center',
      rect: {
        mapping: (elData) => {
          if (elData.source.value > 900) {
            elData.fill = 'gray'
          }
          return elData
        },
      },
      background: {
        fill: 'gray',
        fillOpacity: 0.3,
      },
      text: {
        fontSize: 10,
        format: {
          decimals: 2,
        },
      },
    },
    animation: {
      rect: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
        update: {
          delay: 0,
          duration: updateDuration,
        },
        // loop: {
        //   type: 'scan',
        //   delay: 2000,
        //   duration: 3000,
        //   color: 'rgba(255,255,255,1)',
        //   direction: type === 'bar' ? 'right' : 'top',
        // },
      },
      text: {
        update: {
          delay: 0,
          duration: updateDuration,
        },
      },
    },
    event: {
      'click-rect': (d) => console.log(d),
    },
  },
]
