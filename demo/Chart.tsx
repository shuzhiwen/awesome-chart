import {useCallback, useEffect, useRef, useState} from 'react'
import {createChart, getStandardLayoutCreator, download} from '../src'
import {CreateChartSchema} from '../src/types'
import {MenuItemShape} from './schema'
import styles from './Chart.module.css'

export const Chart = (props: {
  debuggers: MenuItemShape['debuggers']
  schema: MenuItemShape['schema'] & AnyObject
}) => {
  const {debuggers, schema} = props,
    chartRef = useRef(null),
    [chart, setChart] = useState(null),
    [isDebug, setDebug] = useState(false),
    [engine, setEngine] = useState<'svg' | 'canvas'>('svg'),
    toggleEngine = useCallback(() => setEngine(engine === 'svg' ? 'canvas' : 'svg'), [engine]),
    downloadFile = useCallback(() => {
      engine === 'svg'
        ? download(chartRef.current.children?.[0].outerHTML, 'chart.svg')
        : download(chartRef.current.children?.[0].children?.[0].toDataURL(), 'chart.jpg')
    }, [engine]),
    toggleDebug = useCallback(() => {
      if (chart && !isDebug) {
        debuggers.forEach((fn) => fn({chart: chart, interval: 3000}))
        setDebug(true)
      }
    }, [engine, chart])

  useEffect(() => {
    try {
      const container = chartRef.current,
        layoutCreator = getStandardLayoutCreator({brush: false})

      schema.engine = engine
      schema.container = schema.container ?? container
      schema.layoutCreator = schema.layoutCreator ?? layoutCreator

      chart?.destroy()
      schema && setChart(createChart(schema as CreateChartSchema))

      return () => chart?.destroy()
    } catch (e) {
      console.error(e)
    }
  }, [schema, engine])

  return (
    <div className={styles.chartContainer}>
      <div className={styles.title}>
        <div className={styles.button} onClick={toggleDebug}>
          DEBUG
        </div>
        <div className={styles.button} onClick={toggleEngine}>
          {engine.toUpperCase()}
        </div>
        <div className={styles.button} onClick={downloadFile}>
          DOWNLOAD
        </div>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  )
}
