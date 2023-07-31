import {createChart} from 'awesome-chart'

createChart({
  engine: 'svg',
  adjust: false,
  width: 200,
  height: 200,
  padding: [24, 24, 24, 24],
  container: document.body,
  layers: [
    {
      type: 'text',
      options: {
        id: 'title',
        layout: 'main',
      },
      data: 'This is a text',
      style: {
        text: {
          fill: 'red',
          fontSize: 24,
        },
      },
    },
  ],
})
