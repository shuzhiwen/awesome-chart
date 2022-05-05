import React, {useCallback, useState} from 'react'
import styles from './Root.module.css'
import {schemaMenu} from './schema'
import {Editor} from './Editor'
import {Chart} from './Chart'
import {tip} from './schema/base'

export function Root() {
  const {schema, debuggers} = schemaMenu.children[0].children[0],
    [newSchema, setNewSchema] = useState(schema),
    onChange = useCallback((value) => {
      setNewSchema(value)
    }, [])

  return (
    <div className={styles.container}>
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
