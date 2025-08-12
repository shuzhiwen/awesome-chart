import {debounce, isFunction} from 'lodash'
import {CSSProperties, useCallback, useEffect, useState} from 'react'
import {Chart} from './Chart'
import * as debugs from './debug'
import {Editor} from './Editor'
import {Menu} from './Menu'
import base from './schema/base'

const isDebug = localStorage.getItem('AWESOME_MODE') === 'development'

export function Root() {
  const [editorSchema, setEditorSchema] = useState(),
    [chartSchema, setChartSchema] = useState(base([])),
    onEditorChange = useCallback((value) => setEditorSchema(value), []),
    onChartChange = useCallback((value) => setChartSchema(value), []),
    debuggers = Object.values(debugs).filter(isFunction)

  useEffect(() => {
    const listener = () => window.location.reload()
    window.addEventListener('resize', debounce(listener, 500))
    return () => window.removeEventListener('resize', listener)
  }, [])

  return (
    <div style={styles.container}>
      <Menu onChange={onEditorChange} />
      <div style={styles.main}>
        <Editor schema={editorSchema} onChange={onChartChange} />
        <div style={styles.chart}>
          <Chart debuggers={debuggers} schema={chartSchema} variant="dark" />
          <Chart debuggers={debuggers} schema={chartSchema} variant="light" />
        </div>
      </div>
    </div>
  )
}

const styles: Record<'container' | 'main' | 'chart', CSSProperties> = {
  container: {
    opacity: isDebug ? 0.1 : 1,
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
  },
  chart: {
    display: 'grid',
    gridTemplateRows: '1fr 1fr',
    backgroundColor: 'seagreen',
    padding: '12px',
    rowGap: '8px',
  },
}
