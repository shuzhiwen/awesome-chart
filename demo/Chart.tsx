import {useCallback, useEffect, useRef, useState} from 'react'
import styles from './Chart.module.css'
import {createChart, getStandardLayoutCreator, download} from '../src'

export const Chart = ({title, schema}) => {
  const chartRef = useRef(null)
  const [chart, setChart] = useState(null)
  const [engine, setEngine] = useState('SVG')
  const toggleEngine = useCallback(() => setEngine(engine === 'SVG' ? 'CANVAS' : 'SVG'), [engine])
  const downloadSvg = useCallback(() => {
    if (engine === 'SVG') {
      download(chartRef.current.children?.[0].outerHTML, 'chart.svg')
    } else if (engine === 'CANVAS') {
      download(chartRef.current.children?.[0].children?.[0].toDataURL(), 'chart.jpg')
    }
  }, [engine])

  useEffect(() => {
    try {
      const container = chartRef.current,
        layoutCreator = getStandardLayoutCreator({brush: false})

      schema.engine = engine.toLowerCase()
      schema.container = schema.container ?? container
      schema.layoutCreator = schema.layoutCreator ?? layoutCreator

      chart && chart.destroy()
      schema && setChart(createChart(schema))
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
