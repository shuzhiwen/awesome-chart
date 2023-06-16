import ts from 'rollup-plugin-typescript2'
import {uglify} from 'rollup-plugin-uglify'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'es',
      },
    ],
    plugins: [ts()],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/bundle.min.js',
        format: 'es',
      },
    ],
    plugins: [ts(), uglify()],
  },
]
