import {LayerRectOptions} from '../../../src/types'

export default ({
  mode,
  variant,
  sort,
  hasInteractive = false,
}: Partial<LayerRectOptions> & {hasInteractive?: boolean}) =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '柱状图',
    },
    {
      type: 'legend',
      options: {
        layout: 'container',
      },
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
      },
      scale: {
        zero: true,
      },
      style: {
        dynamicReserveTextX: Boolean(sort),
        textY: {
          format: variant === 'column' &&
            mode === 'percentage' && {
              percentage: true,
            },
        },
        textX: {
          format: variant === 'bar' &&
            mode === 'percentage' && {
              percentage: true,
            },
        },
      },
      animation: sort
        ? {
            textY: {
              update: {
                duration: 200,
              },
            },
            textX: {
              update: {
                duration: 0,
              },
            },
            splitLineAxisX: {
              update: {
                duration: 0,
              },
            },
          }
        : undefined,
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
              ['房租', 1000],
              ['饮食', 1000],
              ['服装', 300],
              ['总计', 2300],
            ]
          : {
              type: 'tableList',
              mode: 'normal',
              row: 5,
              column: 2,
              mu: 500,
              sigma: 200,
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
            percentage: mode === 'percentage',
          },
        },
      },
      animation: sort
        ? (theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              update: {duration: 200},
            },
            text: {
              enter: theme.animation.presets.fadeIn,
              update: {duration: 200},
            },
          })
        : variant === 'bar'
        ? (theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              loop: theme.animation.presets.scanRight,
            },
            text: {
              enter: theme.animation.presets.fadeIn,
            },
          })
        : (theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              loop: theme.animation.presets.scanTop,
            },
            text: {
              enter: theme.animation.presets.fadeIn,
            },
          }),
    },
    mode !== 'percentage' &&
      mode !== 'waterfall' && {
        type: 'auxiliary',
        options: {
          layout: 'main',
        },
        data: [
          ['标签', '数值'],
          ['标准', 600],
          ['警戒', 300],
        ],
        style: {
          direction: variant === 'column' ? 'horizontal' : 'vertical',
          labelPosition: variant === 'column' ? 'right' : 'top',
          line: {
            stroke: ['orange', 'red'],
            strokeWidth: 2,
            dasharray: '10 5',
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
