export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '桑基图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'sankey',
    options: {
      layout: 'main',
    },
    scale: {
      fixedBandwidth: 7,
    },
    data: [nodes, links],
    style: {
      direction: 'horizontal',
      align: 'middle',
      labelOffset: 10,
      text: {
        fontSize: 12,
      },
      line: {
        curve: 'curveBasis',
      },
    },
    tooltip: {
      mode: 'single',
      targets: ['circle', 'arc'],
    },
  },
]

const nodes = [
  ['id', 'name'],
  ['一年级', '一年级'],
  ['二年级', '二年级'],
  ['三年级', '三年级'],
  ['四年级', '四年级'],
  ['五年级', '五年级'],
  ['六年级', '六年级'],
  ['受过学前教育', '受过学前教育'],
  ['少数民族', '少数民族'],
  ['五年制', '五年制'],
  ['九年一贯制学校', '九年一贯制学校'],
  ['十二年一贯制学校', '十二年一贯制学校'],
  ['在校生数', '在校生数'],
  ['招生数', '招生数'],
]

const links = [
  ['from', 'to', 'value'],
  ['一年级', '少数民族', 2400624],
  ['二年级', '少数民族', 2283704],
  ['三年级', '少数民族', 2134564],
  ['四年级', '少数民族', 2094022],
  ['五年级', '少数民族', 2010922],
  ['六年级', '少数民族', 1904885],
  ['一年级', '五年制', 568079],
  ['二年级', '五年制', 567358],
  ['三年级', '五年制', 529367],
  ['四年级', '五年制', 517509],
  ['五年级', '五年制', 506344],
  ['一年级', '九年一贯制学校', 2094962],
  ['二年级', '九年一贯制学校', 2061417],
  ['三年级', '九年一贯制学校', 1956352],
  ['四年级', '九年一贯制学校', 1963816],
  ['五年级', '九年一贯制学校', 1973973],
  ['六年级', '九年一贯制学校', 1868869],
  ['受过学前教育', '少数民族', 2342952],
  ['受过学前教育', '五年制', 566962],
  ['受过学前教育', '九年一贯制学校', 2078893],
  ['受过学前教育', '十二年一贯制学校', 251227],
  ['招生数', '受过学前教育', 5240034],
  ['在校生数', '一年级', 5316946],
  ['在校生数', '二年级', 5161013],
  ['在校生数', '三年级', 4847000],
  ['在校生数', '四年级', 4801482],
  ['在校生数', '五年级', 4729154],
  ['在校生数', '六年级', 4015254],
]
