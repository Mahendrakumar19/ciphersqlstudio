import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AssignmentList from './pages/AssignmentList'
import AssignmentAttempt from './pages/AssignmentAttempt'
import './App.scss'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<AssignmentList />} />
          <Route path="/assignments/:id" element={<AssignmentAttempt />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
