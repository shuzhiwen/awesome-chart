import React, {useCallback, useEffect, useState} from 'react'
import styles from './Root.module.css'
import base from './schema/base'
import * as debugs from './debug'
import {debounce} from 'lodash'
import {Editor} from './Editor'
import {Chart} from './Chart'
import {Menu} from './TabMenu'

const isDebug = localStorage.getItem('AWESOME_MODE') === 'development'

export function Root() {
  const [editorSchema, setEditorSchema] = useState(),
    [chartSchema, setChartSchema] = useState(base([])),
    onEditorChange = useCallback((value) => setEditorSchema(value), []),
    onChartChange = useCallback((value) => setChartSchema(value), []),
    debuggers = Object.values(debugs)

  useEffect(() => {
    const listener = () => window.location.reload()
    window.addEventListener('resize', debounce(listener, 500))
    return () => window.removeEventListener('resize', listener)
  }, [])

  return (
    <div className={styles.container}>
      <Menu onChange={onEditorChange} />
      <div className={styles.mainSection}>
        <Editor schema={editorSchema} onChange={onChartChange} />
        <div className={styles.chartSection} style={{opacity: isDebug ? 0.2 : 1}}>
          <Chart debuggers={debuggers} schema={chartSchema} variant="dark" />
          <Chart debuggers={debuggers} schema={chartSchema} variant="light" />
        </div>
      </div>
    </div>
  )
}
