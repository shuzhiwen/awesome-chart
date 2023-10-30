import {LayerRectStyle} from 'awesome-chart/dist/types'
import {randomTableList} from '../../../src'

export default ({
  mode,
  variant,
  hasInteractive = false,
}: Partial<LayerRectStyle> & {hasInteractive?: boolean}) =>
  [
    {
      type: 'text',
      data: '柱状图',
    },
    {
      type: 'legend',
    },
    {
      type: 'axis',
      scale: {
        zero: true,
      },
      style: {
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
    },
    {
      type: 'rect',
      data:
        mode === 'waterfall'
          ? [
              ['支出项', '数量'],
              ['房租', 1000],
              ['饮食', 1000],
              ['服装', 300],
              ['总计', 2300],
            ]
          : randomTableList({
              mode: 'normal',
              row: 5,
              column: 2,
              mu: 500,
              sigma: 200,
              abs: mode === 'percentage' || mode === 'stack',
            }),
      style: {
        mode,
        variant,
        labelPosition:
          mode === 'group'
            ? variant === 'column'
              ? ['top', 'bottom']
              : ['right', 'left']
            : 'center',
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
      animation:
        variant === 'bar'
          ? `(theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              loop: theme.animation.presets.scanRight,
            },
            text: {
              enter: theme.animation.presets.fadeIn,
            },
          })`
          : `(theme) => ({
            rect: {
              enter: theme.animation.presets.zoomIn,
              loop: theme.animation.presets.scanTop,
            },
            text: {
              enter: theme.animation.presets.fadeIn,
            },
          })`,
    },
    mode !== 'percentage' &&
      mode !== 'waterfall' && {
        type: 'auxiliary',
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
    },
  ].filter(Boolean)
