import React, {useCallback, useEffect, useState} from 'react'
import styles from './Root.module.css'
import {schemaMenu} from './schema'
import {Editor} from './Editor'
import {Chart} from './Chart'
import {Menu} from './TabMenu'
import {debounce} from 'lodash'
import * as debugs from './debug'

const isDebug = localStorage.getItem('AWESOME_MODE') === 'development'

export function Root() {
  const {schema} = schemaMenu.children[0].children[0],
    [newSchema, setNewSchema] = useState(schema),
    onChange = useCallback((value) => setNewSchema(value), []),
    debuggers = Object.values(debugs)

  useEffect(() => {
    const listener = () => window.location.reload()
    window.addEventListener('resize', debounce(listener, 500))
    return () => window.removeEventListener('resize', listener)
  }, [newSchema])

  return (
    <div className={styles.container}>
      <Menu onChange={onChange} />
      <div className={styles.mainSection}>
        <Editor schema={newSchema} onChange={onChange} />
        <div className={styles.chartSection} style={{opacity: isDebug ? 0.2 : 1}}>
          <Chart debuggers={debuggers} schema={newSchema} variant="dark" />
          <Chart debuggers={debuggers} schema={newSchema} variant="light" />
        </div>
      </div>
    </div>
  )
}
