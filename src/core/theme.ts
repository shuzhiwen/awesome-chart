import {ChartTheme} from '../types'

export const lightTheme = createDefaultTheme({
  positiveColor: 'black',
  negativeColor: 'white',
})

export const darkTheme = createDefaultTheme({
  positiveColor: 'white',
  negativeColor: 'black',
})

function createDefaultTheme({
  positiveColor,
  negativeColor,
}: {
  positiveColor: string
  negativeColor: string
}): ChartTheme {
  return {
    palette: {
      nice: {
        maxDistance: 85,
        colorSpace: 'lab',
      },
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
      fill: positiveColor,
      stroke: positiveColor,
      evented: true,
    },
    text: {
      fontFamily: '',
      fontSize: 12,
      fontWeight: 400,
      opacity: 1,
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 0,
      fill: positiveColor,
      stroke: positiveColor,
      shadow: `0 0 4px ${negativeColor}`,
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
      presets: {
        zoomIn: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          startScale: 0,
          endScale: 1,
          easing: 'easeOutElastic',
          stagger: 50,
        },
        fadeIn: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          startOpacity: 0,
          endOpacity: 1,
        },
        eraseRight: {
          type: 'erase',
          delay: 0,
          duration: 2000,
          direction: 'right',
        },
        scanRight: {
          type: 'scan',
          delay: 0,
          duration: 5000,
          direction: 'right',
          opacity: 0.5,
          color: 'white',
        },
        scanOut: {
          type: 'scan',
          delay: 0,
          duration: 5000,
          direction: 'outer',
          opacity: 0.5,
          color: 'white',
        },
        scanTop: {
          type: 'scan',
          delay: 0,
          duration: 5000,
          direction: 'top',
          opacity: 0.5,
          color: 'white',
        },
        breath: {
          type: 'fade',
          delay: 1000,
          duration: 2000,
          initialOpacity: 1,
          startOpacity: 1,
          endOpacity: 0.2,
          alternate: true,
        },
      },
    },
  }
}
