export default (layers: AnyObject[]) => ({
  adjust: true,
  width: 100,
  height: 100,
  padding: [60, 60, 60, 60],
  engine: 'svg',
  theme: [
    'rgb(52,200,254)',
    'rgb(0,155,255)',
    'rgb(0,107,253)',
    'rgb(27,69,246)',
    'rgb(66,31,237)',
    'rgb(97,3,230)',
    'rgb(119,0,227)',
    'rgb(157,1,223)',
    'rgb(188,0,219)',
    'rgb(217,0,216)',
    'rgb(238,52,161)',
  ],
  tooltip: {
    mode: 'dimension',
  },
  layers,
})
