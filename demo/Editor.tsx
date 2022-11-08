import * as monaco from 'monaco-editor'
import {useEffect, useMemo, useRef, useState} from 'react'
import styles from './Editor.module.css'
import {download, errorCatcher} from '../src'
import {noop, throttle} from 'lodash'
import chroma from 'chroma-js'
import React from 'react'

const throttleDownload = throttle(download, 500)
const pack = (value: string) => `(() => (${value}))()`

const stringify = errorCatcher(
  (value: any, space = 2) =>
    pack(
      JSON.stringify(
        value,
        (_, key) => {
          if (typeof key === 'function') {
            return `fn{${key.toString()}}fn`
          }
          return key
        },
        space
      )
    ).replace(/"fn\{[\d\D]+?\}fn"/g, (match) =>
      match
        .replace(/\\n/g, '\n')
        .replace(/\\[vrf]{1}/g, '')
        .replace(/\\[\^$+?=!.()\\/()[\]{}"']{1}/g, (match) => match.slice(-1))
        .slice(4, -4)
    ),
  (error) => {
    console.error(error.message)
  }
)

const parse = errorCatcher(
  (value: string, callback: (value: object) => void) => {
    callback(eval(value))
  },
  (error) => {
    console.error(error.message)
  }
)

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
      editor.setValue(schema ?? '')
    }
  }, [editor, schema])

  return <div className={styles.editor} ref={editorRef} />
}
