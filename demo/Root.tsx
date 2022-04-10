import React, {useState} from 'react'
import styles from './Root.module.css'
import schema from './schema'
import {SideBar} from './SideBar'
import {Editor} from './Editor'
import {Chart} from './Chart'
import {tip} from './schema/base'

let backup = schema.children[0].children[0].code

export function Root() {
  const [newSchema, setNewSchema] = useState(backup)

  return (
    <div className={styles.container}>
      <SideBar
        onSelect={({code}) => {
          setNewSchema(code)
        }}
      />
      <div className={styles.mainSection}>
        <Editor
          schema={newSchema}
          onChange={(value) => {
            setNewSchema(value)
            backup = value
          }}
        />
        <div className={styles.chartSection}>
          <Chart title="CURRENT" schema={newSchema} />
          <pre className={styles.tip}>{tip}</pre>
        </div>
      </div>
    </div>
  )
}
