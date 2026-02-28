import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import QueryResults from '../components/QueryResults'
import SampleDataViewer from '../components/SampleDataViewer'
import { assignmentAPI } from '../api/assignments'
import '../styles/pages/assignmentAttempt.scss'

interface Assignment {
  _id: string
  title: string
  question: string
  description: string
  difficulty: string
  sampleData: {
    tables: string[]
    description: string
  }
}

interface QueryResult {
  rows: any[]
  rowCount: number
  columns: string[]
  message: string
}

function AssignmentAttempt() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [showSampleData, setShowSampleData] = useState(true)
  
  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(25)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(30)
  const [isResizing, setIsResizing] = useState<string | null>(null)

  // Handle horizontal resize (left panel)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === 'horizontal') {
        const container = document.querySelector('.top-section')
        if (container) {
          const rect = container.getBoundingClientRect()
          const newWidth = ((e.clientX - rect.left) / rect.width) * 100
          if (newWidth > 15 && newWidth < 50) {
            setLeftPanelWidth(newWidth)
          }
        }
      } else if (isResizing === 'vertical') {
        const container = document.querySelector('.attempt-container')
        if (container) {
          const rect = container.getBoundingClientRect()
          const newHeight = ((rect.bottom - e.clientY) / rect.height) * 100
          if (newHeight > 15 && newHeight < 60) {
            setBottomPanelHeight(newHeight)
          }
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await assignmentAPI.getAssignmentById(id!)
        if (response.data.success) {
          setAssignment(response.data.data)
        }
      } catch (err) {
        setError('Failed to load assignment')
        console.error(err)
      }
    }

    fetchAssignment()
  }, [id])

  const handleExecuteQuery = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await assignmentAPI.executeQuery({
        query,
        assignmentId: id!,
        userId: 'anonymous'
      })

      if (response.data.success && response.data.data) {
        setResults(response.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Query execution failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGetHint = async () => {
    setHintLoading(true)
    setError(null)

    try {
      const response = await assignmentAPI.getHint(
        assignment?.question!,
        query,
        error || undefined
      )

      if (response.data.success) {
        setHint(response.data.data.hint)
      }
    } catch (err: any) {
      setError('Failed to generate hint. Please check your LLM configuration.')
      console.error(err)
    } finally {
      setHintLoading(false)
    }
  }

  const handleClearResults = () => {
    setResults(null)
    setError(null)
    setHint(null)
  }

  return (
    <div className="assignment-attempt-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{assignment?.title}</h1>
        <span className={`difficulty difficulty-${assignment?.difficulty}`}>
          {assignment?.difficulty}
        </span>
      </header>

      <div className="attempt-container">
        {/* Top Row */}
        <div className="top-section" style={{ gap: `${leftPanelWidth}% 1px` }}>
          {/* Left Panel - Question and Data */}
          <aside className="left-panel" style={{ flex: `0 0 ${leftPanelWidth}%` }}>
            <section className="question-section">
              <h2>Question</h2>
              <p className="question-text">{assignment?.question}</p>
              {assignment?.description && (
                <div className="description">
                  <h3>Details</h3>
                  <p>{assignment.description}</p>
                </div>
              )}
            </section>

            <button
              className="toggle-data-button"
              onClick={() => setShowSampleData(!showSampleData)}
            >
              {showSampleData ? '▼' : '▶'} Sample Data
            </button>

            {showSampleData && assignment && (
              <SampleDataViewer tables={assignment.sampleData.tables} />
            )}

            <button
              className="hint-button"
              onClick={handleGetHint}
              disabled={hintLoading}
            >
              {hintLoading ? 'Loading...' : '💡 Get Hint'}
            </button>

            {hint && (
              <div className="hint-section">
                <h3>💡 Hint</h3>
                <p className="hint-text">{hint}</p>
                <button
                  className="close-hint"
                  onClick={() => setHint(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </aside>

          {/* Resize Handle - Horizontal */}
          <div
            className="resize-handle-horizontal"
            onMouseDown={() => setIsResizing('horizontal')}
          />

          {/* Right Panel - Editor */}
          <div className="right-panel" style={{ flex: `1 1 ${100 - leftPanelWidth}%` }}>
            <section className="editor-section">
              <h3>SQL Editor</h3>
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={(value) => setQuery(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on'
                }}
              />
            </section>

            <div className="controls">
              <button
                className="execute-button"
                onClick={handleExecuteQuery}
                disabled={loading}
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
            </div>

            {error && (
              <div className="error-section">
                <h3>Error</h3>
                <p className="error-message">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle - Vertical */}
        <div
          className="resize-handle-vertical"
          onMouseDown={() => setIsResizing('vertical')}
        />

        {/* Bottom Panel - Results */}
        <div className="bottom-section" style={{ flex: `0 0 ${bottomPanelHeight}%` }}>
          {results && (
            <div className="results-section">
              <div className="results-header">
                <h3>Results</h3>
                <button
                  className="close-results"
                  onClick={handleClearResults}
                >
                  ✕
                </button>
              </div>
              <QueryResults results={results} />
            </div>
          )}

          {!results && !error && (
            <div className="placeholder">
              <p>Execute a query to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentAttempt
