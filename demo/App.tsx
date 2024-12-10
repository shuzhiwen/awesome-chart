import './App.css'

import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route} from 'react-router-dom'
import {version} from '../package.json'
import {Root} from './Root'

console.info(`version: ${version}`)

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Route path="/">
        <Root />
      </Route>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
