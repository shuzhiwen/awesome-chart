import './App.css'

import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {version} from '../package.json'
import {Root} from './Root'

console.info(`version: ${version}`)

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route path="/">
        <Root />
      </Route>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
