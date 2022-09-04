import {ChartTheme} from '../types'

export const defaultTheme: ChartTheme = {
  palette: {
    main: [
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
  },
  graph: {
    opacity: 1,
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 0,
    fill: 'white',
    stroke: 'white',
    evented: true,
  },
  text: {
    fontFamily: '',
    fontSize: 12,
    fontWeight: 300,
    opacity: 1,
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 0,
    fill: 'white',
    stroke: 'white',
    shadow: '0 0 4px black',
    evented: false,
  },
  animation: {
    enter: {
      duration: 2000,
      delay: 0,
      easing: 'easeInOutSine',
    },
    loop: {
      duration: 2000,
      delay: 2000,
      easing: 'easeInOutSine',
    },
    update: {
      duration: 2000,
      delay: 0,
      easing: 'easeInOutSine',
    },
  },
}
