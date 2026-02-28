import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { assignmentAPI } from '../api/assignments'
import '../styles/pages/assignmentList.scss'

interface Assignment {
  _id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await assignmentAPI.getAllAssignments()
        if (response.data.success) {
          setAssignments(response.data.data)
        }
      } catch (err) {
        setError('Failed to load assignments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  return (
    <div className="assignment-list-page">
      <header className="header">
        <h1>CipherSQLStudio</h1>
        <p className="subtitle">Master SQL through Interactive Learning</p>
      </header>

      <main className="main-content">
        <section className="assignments-section">
          <h2>Available Assignments</h2>

          {loading && <p className="loading">Loading assignments...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && assignments.length === 0 && (
            <p className="no-assignments">
              No assignments available. Please check back later.
            </p>
          )}

          {!loading && assignments.length > 0 && (
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <Link
                  key={assignment._id}
                  to={`/assignments/${assignment._id}`}
                  className="assignment-card"
                >
                  <div className="card-content">
                    <h3>{assignment.title}</h3>
                    <p className="description">{assignment.description}</p>
                    <div className="card-footer">
                      <span className={`difficulty difficulty-${assignment.difficulty}`}>
                        {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                      </span>
                      <span className="arrow">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 CipherSQLStudio. Learn SQL through practice.</p>
      </footer>
    </div>
  )
}

export default AssignmentList
