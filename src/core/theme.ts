import {ChartTheme} from '../types'

export const themeColors = {
  fairyLand: [
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
    '#EE34A1',
  ],
  emeraldGreen: [
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
    '#67050C',
  ],
  duskUniverse: [
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
    '#2F0098',
  ],
  glaze: [
    '#2A43FF',
    '#0B78FF',
    '#119BFF',
    '#3EBFDA',
    '#6CDDC3',
    '#B5E4AA',
    '#FFEA92',
    '#FFBD6D',
    '#FD926D',
  ],
  exquisite: [
    '#46D4FF',
    '#569EFF',
    '#686EFF',
    '#9D6DFF',
    '#FF61D2',
    '#FF849E',
    '#FF6A59',
    '#FF9456',
    '#FFBD68',
  ],
}

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
      main: themeColors.fairyLand,
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
      /**
       * Empty fontFamily will cause the mobile page to crash.
       */
      fontFamily: 'Arial, Helvetica, Sans-Serif',
      fontSize: 12,
      fontWeight: '400',
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
        duration: 1000,
        delay: 0,
        easing: 'linear',
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
        eraseClockwise: {
          type: 'erase',
          delay: 0,
          duration: 2000,
          direction: 'clockwise',
        },
        scanRight: {
          type: 'scan',
          delay: 0,
          duration: 5000,
          direction: 'right',
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
