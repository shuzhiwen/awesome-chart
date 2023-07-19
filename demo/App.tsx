import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import './App.css'
import {Root} from './Root'

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
