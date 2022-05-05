import * as monaco from 'monaco-editor'
import {useEffect, useMemo, useRef, useState} from 'react'
import styles from './Editor.module.css'
import {download} from '../src'
import {noop, throttle} from 'lodash'
import chroma from 'chroma-js'

const throttleDownload = throttle(download, 500)
const stringify = (value: any, space: number) => {
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

export function Editor(props: {schema: AnyObject; onChange: AnyFunction}) {
  const {schema: _schema, onChange = noop} = props,
    editorRef = useRef<HTMLDivElement>(null),
    schema = useMemo(() => stringify(_schema, 2), [_schema]),
    [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(null)

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
    const container = editorRef.current,
      editor = monaco.editor.create(container, {
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
          /('|")#(.*?)('|")/gi,
          (color) => `"rgb(${chroma(color.split(/'|"/)[1]).rgb().join(',')})"`
        )
      throttleDownload(schemaForDownload, 'schema.txt')
    })

    setEditor(editor)
    onChange(parse(editor.getValue()))

    return () => {
      editor.dispose()
      container.innerHTML = ''
    }
  }, [onChange, schema])

  return <div className={styles.editor} ref={editorRef} />
}
