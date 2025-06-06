import {cloneDeep} from 'lodash'
import {CSSProperties, useCallback, useEffect, useRef, useState} from 'react'
import {
  Chart as ChartShape,
  createChart,
  download,
  getFacetLayoutCreator,
  getStandardLayoutCreator,
} from '../src'
import {darkTheme, lightTheme} from '../src/core/theme'
import {CreateChartProps} from '../src/types'
import {MenuItemShape} from './schema'

export const Chart = (props: {
  variant: 'light' | 'dark'
  debuggers: AnyFunction[]
  schema: MenuItemShape['schema'] & AnyObject
}) => {
  const {debuggers, variant, schema} = props,
    chartRef = useRef<HTMLDivElement>(null),
    [chart, setChart] = useState<ChartShape>(),
    [engine, setEngine] = useState<'svg' | 'canvas'>(
      (localStorage.getItem(`${variant}-engine`) as 'svg' | 'canvas') || 'svg'
    )
  const toggleEngine = useCallback(() => {
    localStorage.setItem(
      `${variant}-engine`,
      engine === 'svg' ? 'canvas' : 'svg'
    )
    setEngine(engine === 'svg' ? 'canvas' : 'svg')
  }, [engine, variant])
  const downloadFile = useCallback(() => {
    engine === 'svg'
      ? download(
          chartRef.current?.querySelector('svg')?.outerHTML ?? '',
          'chart.svg'
        )
      : alert('如需下载，可右键保存该图片')
  }, [engine])
  const toggleDebug = useCallback(
    () => chart && debuggers?.forEach((fn) => fn(chart)),
    [chart, debuggers]
  )

  useEffect(() => {
    try {
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

      return () => newChart.destroy()
    } catch (e) {
      console.error(e)
    }
  }, [schema, engine, variant])

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <div style={styles.button} onClick={toggleDebug}>
          UPDATE
        </div>
        <div style={styles.button} onClick={toggleEngine}>
          {engine.toUpperCase()}
        </div>
        <div style={styles.button} onClick={downloadFile}>
          DOWNLOAD
        </div>
      </div>
      <div
        style={{
          ...styles.chart,
          border: `dotted ${variant === 'light' ? '#eeeeee' : '#101010'} 2px`,
          backgroundColor: variant === 'light' ? '#eeeeee' : '#101010',
        }}
      >
        <div ref={chartRef} style={{width: '100%', height: '100%'}} />
      </div>
    </div>
  )
}

const styles: Record<
  'container' | 'title' | 'button' | 'chart',
  CSSProperties
> = {
  container: {
    color: '#f1f2f3',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    height: '3vh',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingBottom: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  chart: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
  },
}
