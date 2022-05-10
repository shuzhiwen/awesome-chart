/* eslint-disable */

const path = require('path')
const {dependencies} = require('./package.json')

module.exports = {
  mode: 'production',
  entry: {
    main: './dist/index.js',
  },
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'main.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: Object.keys(dependencies).filter((key) => key.search('-') === -1),
}
