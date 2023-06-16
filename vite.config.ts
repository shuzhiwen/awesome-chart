import reactPlugin from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import monacoPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactPlugin(),
    (monacoPlugin as any).default({
      languageWorkers: ['json', 'typescript', 'editorWorkerService'],
    }),
  ],
})
