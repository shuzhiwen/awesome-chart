import {LayerRectOptions} from '../../../src/types'

export default ({
  mode,
  variant,
  sort,
  updateDuration = 2000,
  hasInteractive = false,
}: Partial<LayerRectOptions> & {updateDuration?: number; hasInteractive?: boolean}) =>
  [
    {
      type: 'text',
      options: {
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
        layout: 'container',
      },
    },
    {
      type: 'auxiliary',
      options: {
        layout: 'main',
      },
      data: [
        ['标签', '数值'],
        ['最大值', 300],
        ['最小值', 600],
      ],
      style: {
        direction: variant === 'column' ? 'horizontal' : 'vertical',
        labelPosition: variant === 'column' ? 'right' : 'top',
        line: {
          stroke: 'orange',
          strokeWidth: 2,
          dasharray: '10 5',
        },
        text: {
          fill: 'orange',
          fontSize: 8,
        },
      },
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
      },
      scale: {
        count: 5,
        zero: true,
        paddingInner: 0.382,
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
        layout: 'main',
        axis: 'main',
        mode,
        variant,
        sort,
      },
      data:
        mode === 'waterfall'
          ? [
              ['支出项', '数量'],
              ['房租', 2000],
              ['饮食', 2500],
              ['服装', 500],
              ['总计', 5000],
            ]
          : {
              type: 'tableList',
              mode: 'normal',
              row: 5,
              column: 2,
              mu: 500,
              sigma: 200,
              decimalPlace: 1,
            },
      style: {
        labelPosition: mode === 'group' ? (variant === 'column' ? 'top' : 'right') : 'center',
        background: {
          fill: 'gray',
          fillOpacity: 0.3,
        },
        text: {
          fontSize: 10,
          format: {
            decimals: 2,
            percentage: mode === 'percentage',
          },
        },
      },
      animation: {
        rect: {
          enter: {
            type: 'zoom',
            delay: 0,
            duration: 1000,
            mode: 'enlarge',
            direction: 'both',
            easing: 'easeOutBack',
            stagger: 20,
          },
          loop: !sort && {
            type: 'scan',
            delay: 0,
            duration: 5000,
            direction: variant === 'bar' ? 'right' : 'top',
            opacity: 0.5,
          },
          update: {
            delay: 0,
            duration: updateDuration,
          },
        },
        text: {
          enter: {
            type: 'fade',
            delay: 2000,
            duration: 1000,
            mode: 'fadeIn',
          },
          update: {
            delay: 0,
            duration: updateDuration,
          },
        },
      },
    },
    hasInteractive && {
      type: 'interactive',
      options: {
        layout: 'main',
      },
    },
  ].filter(Boolean)
