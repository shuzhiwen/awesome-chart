import React from 'react'
import styles from './Chart.module.css'
import {useCallback, useEffect, useRef, useState} from 'react'
import {darkTheme, lightTheme} from '../src/core/theme'
import {CreateChartProps} from '../src/types'
import {MenuItemShape} from './schema'
import {cloneDeep} from 'lodash'
import {
  download,
  createChart,
  getFacetLayoutCreator,
  getStandardLayoutCreator,
  Chart as ChartShape,
} from '../src'

export const Chart = (props: {
  variant: 'light' | 'dark'
  debuggers: AnyFunction[]
  schema: MenuItemShape['schema'] & AnyObject
}) => {
  const {debuggers, variant, schema} = props,
    chartRef = useRef<any>(null),
    [chart, setChart] = useState<ChartShape>(),
    [engine, setEngine] = useState<'svg' | 'canvas'>('svg')
  const toggleEngine = useCallback(() => {
    setEngine(engine === 'svg' ? 'canvas' : 'svg')
  }, [engine])
  const downloadFile = useCallback(() => {
    engine === 'svg'
      ? download(chartRef.current?.children?.[0].outerHTML ?? '', 'chart.svg')
      : download(chartRef.current?.children?.[0].children?.[0].toDataURL(), 'chart.jpg')
  }, [engine])
  const toggleDebug = useCallback(
    () => chart && debuggers?.forEach((fn) => fn(chart)),
    [chart, debuggers]
  )

  useEffect(() => {
    const container = chartRef.current
    const newChart = createChart({
      ...cloneDeep(schema),
      layoutCreator: schema.facet
        ? getFacetLayoutCreator(schema.facet)
        : getStandardLayoutCreator({brush: !!schema.hasBrush}),
      theme: variant === 'light' ? lightTheme : darkTheme,
      container,
      engine,
    } as CreateChartProps)

    setChart(newChart)

    return () => newChart?.destroy()
  }, [schema, engine, variant])

  return (
    <div className={styles.chartContainer}>
      <div className={styles.title}>
        <div className={styles.button} onClick={toggleDebug}>
          UPDATE
        </div>
        <div className={styles.button} onClick={toggleEngine}>
          {engine.toUpperCase()}
        </div>
        <div className={styles.button} onClick={downloadFile}>
          DOWNLOAD
        </div>
      </div>
      <div
        ref={chartRef}
        className={styles.chart}
        style={{
          border: `dotted ${variant === 'light' ? '#eeeeee' : '#101010'} 2px`,
          backgroundColor: variant === 'light' ? '#eeeeee' : '#101010',
        }}
      />
    </div>
  )
}
