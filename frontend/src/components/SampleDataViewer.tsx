import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/components/sampleDataViewer.scss'

interface TableData {
  [key: string]: any
}

interface SampleDataViewerProps {
  tables: string[]
}

function SampleDataViewer({ tables }: SampleDataViewerProps) {
  const [selectedTable, setSelectedTable] = useState<string>(tables[0] || '')
  const [data, setData] = useState<TableData[]>([])
  const [schema, setSchema] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedTable) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [dataRes, schemaRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/query/sample/${selectedTable}`
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/query/schema/${selectedTable}`
          )
        ])

        if (dataRes.data.success) {
          setData(dataRes.data.data)
        }
        if (schemaRes.data.success) {
          setSchema(schemaRes.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch table data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTable])

  return (
    <section className="sample-data-viewer">
      <h3>Sample Data</h3>

      <div className="table-selector">
        <label htmlFor="table-select">Table: </label>
        <select
          id="table-select"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading">Loading...</p>}

      {!loading && schema.length > 0 && (
        <div className="schema-info">
          <h4>Schema</h4>
          <ul className="schema-list">
            {schema.map((col: any) => (
              <li key={col.column_name}>
                <strong>{col.column_name}</strong>: {col.data_type}
                {col.is_nullable === 'NO' ? ' NOT NULL' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val: any, i) => (
                    <td key={i}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default SampleDataViewer
