import {useCallback, useEffect, useRef, useState} from 'react'
import {Chart as ChartShape, createChart, download, getStandardLayoutCreator} from '../src'
import {CreateChartProps} from '../src/types'
import {MenuItemShape} from './schema'
import styles from './Chart.module.css'
import {cloneDeep} from 'lodash'
import React from 'react'

const isDebug = (import.meta as any).env?.MODE === 'development'

export const Chart = (props: {
  debuggers: AnyFunction[]
  schema: MenuItemShape['schema'] & AnyObject
}) => {
  const {debuggers, schema: _schema} = props,
    chartRef = useRef<any>(null),
    [chart, setChart] = useState<ChartShape>(),
    [engine, setEngine] = useState<'svg' | 'canvas'>('svg'),
    toggleEngine = useCallback(() => setEngine(engine === 'svg' ? 'canvas' : 'svg'), [engine]),
    downloadFile = useCallback(() => {
      engine === 'svg'
        ? download(chartRef.current?.children?.[0].outerHTML ?? '', 'chart.svg')
        : download(chartRef.current?.children?.[0].children?.[0].toDataURL(), 'chart.jpg')
    }, [engine]),
    toggleDebug = useCallback(
      () => chart && debuggers?.forEach((fn) => fn(chart)),
      [chart, debuggers]
    )

  useEffect(() => {
    try {
      const container = chartRef.current
      const newChart = createChart({
        ...cloneDeep(_schema),
        layoutCreator: getStandardLayoutCreator({brush: true}),
        container,
        engine,
      } as CreateChartProps)

      setChart(newChart)

      return () => newChart?.destroy()
    } catch (error) {
      console.error(error)
    }
  }, [_schema, engine])

  return (
    <div className={styles.chartContainer} style={{opacity: isDebug ? 0.2 : 1}}>
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
