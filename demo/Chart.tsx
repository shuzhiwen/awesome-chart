import {useCallback, useEffect, useRef, useState} from 'react'
import {select} from 'd3-selection'
import styles from './Chart.module.css'
import {createChart, getStandardLayoutCreator, download} from '../src'

export const Chart = ({title, schema}) => {
  const chartRef = useRef(null)
  const [chart, setChart] = useState(null)
  const [engine, setEngine] = useState('SVG')
  const toggleEngine = useCallback(() => setEngine(engine === 'SVG' ? 'CANVAS' : 'SVG'), [engine])
  const downloadSvg = useCallback(() => {
    download((select(chartRef.current).selectAll('svg').nodes()[0] as any).outerHTML, 'chart.svg')
  }, [])

  useEffect(() => {
    try {
      const container = chartRef.current,
        layout = getStandardLayoutCreator({brush: false}),
        schemaCreator = eval(schema.replace('ENGINE', engine.toLowerCase())),
        chartSchema = schemaCreator()

      chartSchema.container = chartSchema.container ?? container
      chartSchema.layout = chartSchema.layout ?? layout

      chart && chart.destroy()
      schema && setChart(createChart(chartSchema))
    } catch (e) {
      console.error(e)
    }
  }, [schema, engine])

  return (
    <div className={styles.chartContainer}>
      <div className={styles.title}>
        <div className={styles.button}>{title} </div>
        <div className={styles.button} onClick={toggleEngine}>
          {engine}
        </div>
        <div className={styles.button} onClick={downloadSvg}>
          DOWNLOAD
        </div>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  )
}
