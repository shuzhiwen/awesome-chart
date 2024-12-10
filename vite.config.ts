import reactPlugin from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import monacoPlugin from 'vite-plugin-monaco-editor'
import {name} from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/${name}`,
  plugins: [
    reactPlugin(),
    (monacoPlugin as any).default({
      languageWorkers: ['json', 'typescript', 'editorWorkerService'],
    }),
  ],
})
