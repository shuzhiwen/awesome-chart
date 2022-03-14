import React, {useState} from 'react'
import styles from './Root.module.css'
import schema from './schema'
import {SideBar} from './SideBar'
import {Editor} from './Editor'
import {Chart} from './Chart'

let backup = schema.children[0].children[0].code

export function Root() {
  const [oldSchema, setOldSchema] = useState(backup)
  const [newSchema, setNewSchema] = useState(backup)

  return (
    <div className={styles.container}>
      <SideBar
        onSelect={({code}) => {
          setOldSchema(code)
          setNewSchema(code)
        }}
      />
      <div className={styles.mainSection}>
        <div className={styles.editorSection}>
          <Editor
            schema={newSchema}
            onChange={(value) => {
              setOldSchema(backup)
              setNewSchema(value)
              backup = value
            }}
          />
        </div>
        <div className={styles.chartSection}>
          {/* <Chart title="PREVIOUS" schema={oldSchema} /> */}
          <Chart title="CURRENT" schema={newSchema} />
        </div>
      </div>
    </div>
  )
}
