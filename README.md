# [Awesome Chart](http://www.shuzhiwen.com/app/chart) &middot; [![npm version](https://img.shields.io/badge/npm-alpha-blue)](https://www.npmjs.com/package/awesome-chart)

Awesome Chart is a lightweight 2d chart library. It should be noted that the use of the framework is greater than the use of the chart library.

## Installation

```zsh
npm install awesome-chart
yarn add awesome-chart
```

## Documents

1. [Some basic concepts of chart.](./docs/concept.md)
2. [How charts lay out content.](./docs/layout.md)
3. [How charts work with data.](./docs/data.md)

## Examples

There are several examples [on the website](http://www.shuzhiwen.com/app/chart). Awesome Chart supports two ways of writing.

> For command style

```js
import {Chart, DataBase} from 'awesome-chart'

const chart = new Chart({
  engine: 'svg',
  adjust: false,
  width: 200,
  height: 200,
  padding: [24, 24, 24, 24],
  container: document.body,
})

const textLayer = chart.createLayer({
  id: 'title',
  type: 'text',
  layout: chart.layout.main,
})

textLayer?.setData(new DataBase('This is a text'))
textLayer?.setStyle({
  text: {
    fill: 'red',
    fontSize: 24,
  },
})

chart.draw()
```

> For declarative style

```js
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
```
