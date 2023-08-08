import chroma from 'chroma-js'
import {noop, throttle} from 'lodash'
import * as monaco from 'monaco-editor'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import * as awesome from '../src'
import {download, errorCatcher} from '../src'
import styles from './Editor.module.css'

const throttleDownload = throttle(download, 500)

const stringify = errorCatcher(
  (value: unknown, space = 2, noPack = false) => {
    if (!value) return ''

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
        .replace(/^(fn{)+/, '')
        .replace(/(}fn)+$/, '')
        .slice(4, -4)
    )

    return noPack ? result : `(() => (${result}))()`
  },
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

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `${Object.entries(awesome).reduce(
    (prev, [key]) => `${prev}${key}:any;`,
    'interface Window {awesome: {'
  )}}}`
)
;(window as any).awesome = awesome

export function Editor(props: {schema?: AnyObject; onChange: AnyFunction}) {
  const {schema: _schema, onChange = noop} = props,
    editorRef = useRef<HTMLDivElement>(null),
    schema = useMemo(() => stringify(_schema, 2), [_schema]),
    [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()

  useEffect(() => {
    if (!editorRef.current) return

    const container = editorRef.current
    const editor = monaco.editor.create(container, {
      value: localStorage.getItem('editorContent') ?? '// 点击左侧菜单选择图表',
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
    parse(editor.getValue(), (value) => value && onChange(value))

    return () => editor.dispose()
  }, [onChange])

  useEffect(() => {
    editor?.trigger('source', 'editor.action.formatDocument', null)

    if (editor && schema && editor.getValue() !== schema) {
      editor.setValue(schema ?? '')
      localStorage.setItem('editorContent', schema ?? '')
      parse(editor.getValue(), (value) => onChange(value))
    }
  }, [editor, onChange, schema])

  return <div className={styles.editor} ref={editorRef} />
}
