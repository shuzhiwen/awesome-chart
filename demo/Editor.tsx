// @ts-nocheck
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import {useEffect, useRef, useState} from 'react'
import styles from './Editor.module.css'
import {download} from '../src'
import {throttle} from 'lodash'
import chroma from 'chroma-js'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

const throttleDownload = throttle(download, 500)

export function Editor({schema, onChange}) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(null)

  useEffect(() => {
    if (editor && schema) {
      const state = editor.saveViewState()
      editor.setValue(schema)
      editor.restoreViewState(state)
      editor.trigger('source', 'editor.action.formatDocument')
      localStorage.setItem('editorContent', schema)
    }
  }, [schema])

  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current, {
      value: localStorage.getItem('editorContent') || schema,
      language: 'typescript',
      fontSize: 14,
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onChange(editor.getValue())
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
    onChange(editor.getValue())
  }, [])

  return <div className={styles.editor} ref={editorRef} />
}
