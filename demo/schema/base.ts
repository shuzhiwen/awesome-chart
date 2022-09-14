import {TooltipOptions} from '../../src/types'

export default (layers: any[], tooltipOptions?: Omit<TooltipOptions, 'container'>) => ({
  adjust: true,
  width: 100,
  height: 100,
  padding: [50, 50, 50, 50],
  engine: 'svg',
  tooltipOptions: {
    mode: 'single',
    ...tooltipOptions,
  },
  layers,
})

export const tip = `备注
示例配置并非图表绘制所需的最小配置
保存编辑器内容后更新右边图表

常用快捷键
搜索内容: command + f
保存配置: command + s
撤销操作: command + z

常用主题颜色
梦幻岛[
  '#34C8FE',
  '#009BFF',
  '#006BFD',
  '#1B45F6',
  '#421FED',
  '#6103E6',
  '#7700E3',
  '#9D01DF',
  '#BC00DB',
  '#D900D8',
  '#EE34A1'
]
冷翡翠[
  '#FFE800',
  '#A5E000',
  '#3BD146',
  '#00BA73',
  '#00A088',
  '#008490',
  '#226191',
  '#42408C',
  '#4E207C',
  '#B23C33',
  '#67050C'
]
黄昏宇宙[
  '#EDFB00',
  '#FFD000',
  '#FFA600',
  '#FF8235',
  '#F55F58',
  '#E13F73',
  '#C8188C',
  '#A900A5',
  '#8400AF',
  '#4600A3',
  '#2F0098'
]
琉璃盏[
  '#2A43FF',
  '#0B78FF',
  '#119BFF',
  '#3EBFDA',
  '#6CDDC3',
  '#B5E4AA',
  '#FFEA92',
  '#FFBD6D',
  '#FD926D'
]
玲珑伞[
  '#46D4FF',
  '#569EFF',
  '#686EFF',
  '#9D6DFF',
  '#FF61D2',
  '#FF849E',
  '#FF6A59',
  '#FF9456',
  '#FFBD68'
]`
