import {useEffect, useRef, useState} from 'react'
import {select} from 'd3-selection'
import styles from './chart.module.css'
import {createChart, getStandardLayoutCreator, download} from '..'

export const Chart = ({title, schema}) => {
  const chartRef = useRef(null)
  const [chart, setChart] = useState(null)
  const downloadSvg = () => {
    if (chartRef.current) {
      download(select(chartRef.current).selectAll('svg').nodes()[0].outerHTML, 'chart.svg')
    }
  }

  useEffect(() => {
    try {
      if (schema) {
        // environment
        const container = chartRef.current,
          layout = getStandardLayoutCreator({brush: false}),
          schemaCreator = eval(schema),
          chartSchema = schemaCreator()

        chartSchema.container = chartSchema.container ?? container
        chartSchema.layout = chartSchema.layout ?? layout

        chart && chart.destroy()
        schema && setChart(createChart(chartSchema))
      }
    } catch (e) {
      console.log(e)
    }
  }, [schema])

  return (
    <div className={styles.chartContainer}>
      <div className={styles.title}>
        <div>{title} </div>
        <div className={styles.download} onClick={downloadSvg}>
          DOWNLOAD
        </div>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  )
}
