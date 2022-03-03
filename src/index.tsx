import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Demo, Log} from './demo'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route path="/">
        <Demo />
      </Route>
      <Route path="/log">
        <Log />
      </Route>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
