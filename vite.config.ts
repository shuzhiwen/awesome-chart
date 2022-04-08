import {defineConfig} from 'vite'
import reactPlugin from '@vitejs/plugin-react'
import monacoPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactPlugin(),
    monacoPlugin({languageWorkers: ['json', 'typescript', 'editorWorkerService']}),
  ],
})
