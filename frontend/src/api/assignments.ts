import apiClient from './client'

export interface QueryExecuteRequest {
  query: string
  assignmentId: string
  userId?: string
}

export interface QueryExecuteResponse {
  success: boolean
  data?: {
    rows: any[]
    rowCount: number
    columns: string[]
    message: string
  }
  error?: string
}

export const assignmentAPI = {
  getAllAssignments: () =>
    apiClient.get('/assignments'),

  getAssignmentById: (id: string) =>
    apiClient.get(`/assignments/${id}`),

  executeQuery: (payload: QueryExecuteRequest) =>
    apiClient.post<QueryExecuteResponse>('/query/execute', payload),

  getTableSchema: (tableName: string) =>
    apiClient.get(`/query/schema/${tableName}`),

  getSampleData: (tableName: string, limit: number = 10) =>
    apiClient.get(`/query/sample/${tableName}`, { params: { limit } }),

  getHint: (question: string, attemptedQuery?: string, error?: string) =>
    apiClient.post('/hint', {
      question,
      attemptedQuery,
      error
    }),

  getUserAttempts: (userId?: string, assignmentId?: string) =>
    apiClient.get('/attempts', { params: { userId, assignmentId } })
}

export default assignmentAPI
