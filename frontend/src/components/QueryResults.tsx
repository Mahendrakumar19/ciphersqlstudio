import React from 'react'
import '../styles/components/queryResults.scss'

interface QueryResultsProps {
  results: {
    rows: any[]
    rowCount: number
    columns: string[]
    message: string
  }
}

function QueryResults({ results }: QueryResultsProps) {
  if (results.rowCount === 0) {
    return (
      <div className="query-results">
        <p className="no-results">No rows returned from query</p>
      </div>
    )
  }

  const columns = results.columns || (results.rows.length > 0 ? Object.keys(results.rows[0]) : [])

  return (
    <div className="query-results">
      <div className="results-info">
        <p className="result-message">{results.message}</p>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={`${rowIdx}-${col}`}>
                    {JSON.stringify(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default QueryResults
