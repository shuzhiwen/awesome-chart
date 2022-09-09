import React, {useCallback, useState} from 'react'
import styles from './Root.module.css'
import {schemaMenu} from './schema'
import {Editor} from './Editor'
import {Chart} from './Chart'
import {tip} from './schema/base'
import {Menu} from './TabMenu'
import * as debugs from './debug'
import * as draws from '../src/draws'
import * as utils from '../src/utils'

window.AWESOME_CHART = {
  __env: {
    mode: 'development',
  },
  __awesome: {
    ...draws,
    ...utils,
  },
} as any

export function Root() {
  const {schema} = schemaMenu.children[0].children[0],
    [newSchema, setNewSchema] = useState(schema),
    onChange = useCallback((value) => setNewSchema(value), []),
    debuggers = Object.values(debugs)

  return (
    <div className={styles.container}>
      <Menu onChange={onChange} />
      <div className={styles.mainSection}>
        <Editor schema={newSchema} onChange={onChange} />
        <div className={styles.chartSection}>
          <Chart debuggers={debuggers} schema={newSchema} />
          <pre className={styles.tip}>{tip}</pre>
        </div>
      </div>
    </div>
  )
}
