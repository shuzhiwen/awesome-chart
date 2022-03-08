import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController'
import {useEffect, useRef, useState} from 'react'
import styles from './editor.module.css'
import {download} from '..'

export function Editor({schema, onChange}) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    if (editor && schema) {
      const state = editor.saveViewState()
      editor.setValue(schema)
      editor.restoreViewState(state)
    }
  }, [schema])

  useEffect(() => {
    const instance = monaco.editor.create(editorRef.current, {
      fontSize: 16,
      value: schema || '"hello world !"',
      language: 'javascript',
    })
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      onChange(instance.getValue())
    })
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D, () => {
      download(instance.getValue(), 'schema.txt')
    })
    setEditor(instance)
  }, [])

  return <div className={styles.editor} ref={editorRef} />
}
