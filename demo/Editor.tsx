import * as monaco from 'monaco-editor'
import {useEffect, useMemo, useRef, useState} from 'react'
import styles from './Editor.module.css'
import {download} from '../src'
import {noop, throttle} from 'lodash'
import chroma from 'chroma-js'

const throttleDownload = throttle(download, 500)
const stringify = (value: string, space: number) => {
  try {
    return JSON.stringify(value, null, space)
  } catch (error) {
    console.error(error.message)
  }
}
const parse = (value: any) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error(error.message)
  }
}

export function Editor({schema: _schema, onChange = noop}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(null)
  const schema = useMemo(() => stringify(_schema, 2), [_schema])

  useEffect(() => {
    if (editor && schema) {
      const state = editor.saveViewState()
      editor.setValue(schema)
      editor.restoreViewState(state)
      editor.trigger('source', 'editor.action.formatDocument', null)
      localStorage.setItem('editorContent', schema)
    }
  }, [schema, editor])

  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current, {
      value: localStorage.getItem('editorContent') || schema,
      language: 'json',
      fontSize: 14,
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onChange(parse(editor.getValue()))
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
    onChange(parse(editor.getValue()))

    return () => {
      editor.dispose()
      editorRef.current.innerHTML = ''
    }
  }, [])

  return <div className={styles.editor} ref={editorRef} />
}
