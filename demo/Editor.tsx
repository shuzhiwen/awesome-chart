import * as monaco from 'monaco-editor'
import {useEffect, useMemo, useRef, useState} from 'react'
import styles from './Editor.module.css'
import {download} from '../src'
import {noop, throttle} from 'lodash'
import chroma from 'chroma-js'

const throttleDownload = throttle(download, 500)

export function Editor({schema: _schema, onChange = noop}) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(null)
  const schema = useMemo(() => JSON.stringify(_schema, null, 2), [_schema])

  useEffect(() => {
    if (editor && schema) {
      const state = editor.saveViewState()
      editor.setValue(schema)
      editor.restoreViewState(state)
      editor.trigger('source', 'editor.action.formatDocument', null)
      localStorage.setItem('editorContent', schema)
    }
  }, [schema])

  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current, {
      value: schema,
      language: 'json',
      fontSize: 14,
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onChange(JSON.parse(editor.getValue()))
    })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      const schemaForDownload = editor
        .getValue()
        .replace(
          /(\'|\")#(.*?)(\'|\")/gi,
          (color) => `"rgb(${chroma(color.split(/\'|\"/)[1]).rgb().join(',')})"`
        )
      throttleDownload(schemaForDownload, 'schema.txt')
    })

    setEditor(editor)
    onChange(JSON.parse(editor.getValue()))

    return () => {
      editor.dispose()
      editorRef.current.innerHTML = ''
    }
  }, [])

  return <div className={styles.editor} ref={editorRef} />
}
