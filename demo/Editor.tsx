import * as awesome from '../src'
import * as monaco from 'monaco-editor'
import styles from './Editor.module.css'
import {useEffect, useMemo, useRef, useState} from 'react'
import {download, errorCatcher} from '../src'
import {noop, throttle} from 'lodash'
import chroma from 'chroma-js'
import React from 'react'

const throttleDownload = throttle(download, 500)

export const stringify = errorCatcher(
  (value: unknown, space = 2, noPack = false) => {
    const result = JSON.stringify(
      value,
      (key, value) => {
        return (key === 'mapping' || key === 'render' || key === 'animation') &&
          typeof value === 'string'
          ? `fn{${value}}fn`
          : value
      },
      space
    ).replace(/"fn\{[\d\D]+?\}fn"/g, (match) =>
      match
        .replace(/\\n/g, '\n')
        .replace(/\\[vrf]{1}/g, '')
        .replace(/\\[\^$+?=!.()\\/()[\]{}"']{1}/g, (match) => match.slice(-1))
        .slice(4, -4)
    )
    return noPack ? result : `(() => (${result}))()`
  },
  (error) => {
    console.error(error.message)
  }
)

export const parse = errorCatcher(
  (value: string, callback: (value: object) => void) => {
    callback(eval(value))
  },
  (error) => {
    console.error(error.message)
  }
)

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `${Object.entries(awesome).reduce(
    (prev, [key]) => `${prev}${key}:any;`,
    'interface Window {awesome: {'
  )}}}`
)
;(window as any).awesome = awesome

export function Editor(props: {schema: AnyObject; onChange: AnyFunction}) {
  const {schema: _schema, onChange = noop} = props,
    editorRef = useRef<HTMLDivElement>(null),
    schema = useMemo(() => stringify(_schema, 2), [_schema]),
    [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()

  useEffect(() => {
    if (!editorRef.current) return

    const container = editorRef.current,
      editor = monaco.editor.create(container, {
        value: localStorage.getItem('editorContent') ?? '',
        language: 'typescript',
        fontSize: 14,
        tabSize: 2,
      })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      parse(editor.getValue(), (value) => onChange(value))
      localStorage.setItem('editorContent', editor.getValue())
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
    parse(editor.getValue(), (value) => onChange(value))

    return () => {
      editor.dispose()
      container.innerHTML = ''
    }
  }, [onChange])

  useEffect(() => {
    editor?.trigger('source', 'editor.action.formatDocument', null)
    if (editor && editor.getValue() !== schema) {
      localStorage.setItem('editorContent', schema ?? '')
      editor.setValue(schema ?? '')
    }
  }, [editor, schema])

  return <div className={styles.editor} ref={editorRef} />
}
