export default () => [
  {
    type: 'text',
    data: '和弦图',
  },
  {
    type: 'chord',
    data: {
      type: 'table',
      mode: 'poisson',
      row: 10,
      column: 10,
      lambda: 40,
      mu: 1000,
      sigma: 400,
      decimalPlace: 1,
    },
    style: {
      labelOffset: 10,
      line: {
        curve: 'curveBasis',
      },
    },
  },
]
