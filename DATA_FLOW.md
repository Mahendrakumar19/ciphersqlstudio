# CipherSQLStudio - Data Flow Diagram

## Overview
This document describes the complete data flow from user interaction (clicking "Execute Query") through to the result being displayed on screen.

## 1. Query Execution Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                    User Interaction                                    │
│  User clicks "Execute Query" button in AssignmentAttempt page        │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend Validation (React Component)                   │
│  1. Check if query is not empty                                      │
│  2. Store current state (query, assignmentId)                        │
│  3. Set loading state to true                                        │
│  4. Clear previous results/errors                                    │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│              HTTP POST Request (Axios)                                 │
│  POST /api/query/execute                                             │
│  Body: {                                                              │
│    query: "SELECT * FROM users;",                                   │
│    assignmentId: "507f1f77bcf86cd799439011",                         │
│    userId: "anonymous"                                               │
│  }                                                                    │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │   Network      │
        │   HTTP/JSON    │
        │                 │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│           Backend Request Handler (Express)                           │
│  executeUserQuery() in assignmentController.ts                       │
│  1. Extract query, assignmentId, userId from req.body                │
│  2. Validate required fields                                         │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│           Query Validation (queryService.ts)                          │
│  validateQuery(query)                                                 │
│  1. Check if starts with SELECT (only allow reads)                   │
│  2. Block dangerous keywords: DROP, DELETE, INSERT, UPDATE, etc.    │
│  3. Prevent SQL injection patterns                                   │
│  4. Return validation result: { isValid: boolean, error?: string }  │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
      Valid          Invalid
         │               │
         ▼               ▼
    Continue    Return 400 Error
                {
                  success: false,
                  error: "Only SELECT queries are allowed..."
                }
                     │
                     │ (Jump to step 12)
                     ▼
```

## 2. Query Execution Against PostgreSQL

```
┌────────────────────────────────────────────────────────────────────────┐
│        PostgreSQL Query Execution (queryService.ts)                   │
│  executeQuery(validatedQuery)                                         │
│  1. Create connection from pool                                       │
│  2. Start execution timer                                             │
│  3. Execute query with timeout (5 seconds)                           │
│  4. Return QueryResult object:                                        │
│     {                                                                 │
│       rows: [...],         // Array of result rows                   │
│       rowCount: number,    // Number of rows returned                │
│       fields: [...],       // Column information                      │
│       executionTime: ms    // Query execution time                   │
│     }                                                                 │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
      Success          Error
         │                │
         ▼                ▼
    Continue    Catch Error:
                - Timeout
                - Syntax Error
                - Connection Error
                - Access Denied
                     │
                     ▼
                Throw Error Object:
                {
                  success: false,
                  error: "specific error message",
                  details: "user-friendly message"
                }
                (Jump to step 12)
```

## 3. Save Attempt to MongoDB

```
┌────────────────────────────────────────────────────────────────────────┐
│  Create UserAttempt Document (MongoDB)                                │
│  1. Create new UserAttempt instance                                   │
│  2. Store:                                                            │
│     {                                                                 │
│       userId: "anonymous",                                           │
│       assignmentId: "507f1f77bcf86cd799439011",                      │
│       query: "SELECT * FROM users;",                                │
│       result: {                                                       │
│         rows: [...],                                                 │
│         rowCount: 5                                                  │
│       },                                                              │
│       status: "success",                                             │
│       executedAt: 2025-02-25T10:30:00Z                             │
│     }                                                                 │
│  3. Call .save() to persist to MongoDB                              │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│        Prepare Success Response (Express)                             │
│  Return 200 HTTP Status Code with JSON:                              │
│  {                                                                    │
│    success: true,                                                    │
│    data: {                                                           │
│      rows: [                                                         │
│        { id: 1, name: "Alice", email: "alice@example.com" },        │
│        { id: 2, name: "Bob", email: "bob@example.com" }             │
│      ],                                                              │
│      rowCount: 5,                                                    │
│      columns: ["id", "name", "email"],                             │
│      message: "Query executed successfully. 5 rows returned."        │
│    }                                                                 │
│  }                                                                    │
└────────────────┬───────────────────────────────────────────────────────┘
```

## 4. Network Response to Frontend

```
┌────────────────────────────────────────────────────────────────────────┐
│         HTTP Response (200 OK)                                         │
│  Response headers:                                                    │
│  - Content-Type: application/json                                    │
│  - Access-Control-Allow-Origin: (CORS headers)                       │
│                                                                       │
│  Response body: { success, data } (see above)                        │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │   Network      │
        │   HTTP/JSON    │
        │                 │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│    Frontend Response Handler (React - AssignmentAttempt.tsx)         │
│  1. Axios success callback triggered                                  │
│  2. Check response.data.success === true                             │
│  3. Extract results from response.data.data                          │
│  4. Update React state:                                              │
│     setResults({                                                      │
│       rows: [...],                                                    │
│       rowCount: 5,                                                    │
│       columns: ["id", "name", "email"],                             │
│       message: "Query executed successfully. 5 rows returned."        │
│     })                                                                │
│  5. Set loading state to false                                       │
│  6. Clear error state                                                │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│        React Component Re-render                                       │
│  1. The right-panel component re-renders                             │
│  2. results state is no longer null                                  │
│  3. QueryResults component becomes visible                           │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│   Display Results in Results Panel (QueryResults Component)          │
│  1. Render results-section container                                 │
│  2. Display message: "Query executed successfully. 5 rows returned." │
│  3. Extract column names from results.columns                        │
│  4. Create HTML table:                                               │
│     ┌─────┬───────┬──────────────────┐                              │
│     │ id  │ name  │ email            │                              │
│     ├─────┼───────┼──────────────────┤                              │
│     │ 1   │ Alice │ alice@example.com│                              │
│     │ 2   │ Bob   │ bob@example.com  │                              │
│     └─────┴───────┴──────────────────┘                              │
│  5. Make table scrollable for many columns/rows                      │
│  6. Apply CSS styling for visual hierarchy                           │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│              User Sees Results                                         │
│  Results displayed in the right panel of the UI                      │
│  User can:                                                            │
│  - Scroll through results                                            │
│  - Modify query and execute again                                    │
│  - Request hint                                                       │
│  - Clear results and start fresh                                     │
└────────────────────────────────────────────────────────────────────────┘
```

## 5. Error Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│              Query Validation Fails                                    │
│  Example: User submits DELETE query                                   │
│  validateQuery() returns:                                             │
│  {                                                                    │
│    isValid: false,                                                    │
│    error: "DELETE operations are not permitted..."                  │
│  }                                                                    │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│          Return Error Response (400 Bad Request)                      │
│  {                                                                    │
│    success: false,                                                   │
│    error: "DELETE operations are not permitted..."                  │
│  }                                                                    │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │   Network      │
        │   HTTP/JSON    │
        │                 │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│     Frontend Error Handler (Axios catch block)                        │
│  1. Catch error from axios                                           │
│  2. Extract error message from response.data.error                   │
│  3. Update state:                                                     │
│     setError("DELETE operations are not permitted...")             │
│  4. Set loading to false                                            │
│  5. Clear results state                                             │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│        React Component Re-render                                       │
│  1. error state is updated                                           │
│  2. results state becomes null                                       │
│  3. error-section becomes visible                                    │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│    Display Error Message to User                                      │
│  error-section rendered with:                                        │
│  ┌────────────────────────────────┐                                 │
│  │ Error                          │                                 │
│  │ DELETE operations are not     │                                 │
│  │ permitted...                   │                                 │
│  └────────────────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────┘
```

## 6. State Updates Summary

### Frontend State Changes (React)
```
Loading States:
1. Initial: query="", results=null, error=null, loading=false
2. User types: query="SELECT * FROM users;"
3. User clicks Execute: loading=true, error=null, results=null
4. Response received: 
   - Success: results={rows, rowCount, columns, message}, error=null, loading=false
   - Error: results=null, error="error message", loading=false
```

### Backend State (Express)
```
1. Request received - extract and validate
2. Validate query against security rules
3. Execute against PostgreSQL
4. Save attempt to MongoDB
5. Return response to client
6. Log for monitoring/debugging
```

## 7. Performance Considerations

### Query Timeout
- Configured to 5 seconds by default
- Prevents long-running queries from blocking
- Returns timeout error if exceeded

### Database Connection Pooling
- PostgreSQL: Uses pg.Pool for connection reuse
- MongoDB: Uses mongoose connection pooling
- Improves response time for subsequent queries

### Response Optimization
- Only rows are returned, not full query metadata
- Column names extracted minimal overhead
- Error messages kept concise

## 8. Security Flow

```
User Query Input
       │
       ▼
Frontend Validation (optional, not trusted)
       │
       ▼
Network Transmission (HTTPS in production)
       │
       ▼
Backend Validation (TRUSTED)
  1. Check starts with SELECT
  2. Blacklist dangerous keywords
  3. Check query structure
       │
  ┌────┴───┐
  │        │
Valid   Invalid
  │        │
  ▼        ▼
Execute  Reject
  │        │
  └────┬───┘
       ▼
Return to User
```

## 9. Hint Generation Flow

```
User clicks "Get Hint"
       │
       ▼
PrepareHint Payload:
{
  question: "Write a query to get all posts...",
  attemptedQuery: "SELECT * FROM users;",
  error: null  // or error message if query failed
}
       │
       ▼
POST /api/hint
       │
       ▼
Backend: generateHint()
  1. Select LLM provider (OpenAI or Gemini)
  2. Build prompt with guidelines
  3. Send to LLM API
  4. Receive hint text
       │
       ▼
Response: { hint: "Consider using...", guidance: "..." }
       │
       ▼
Frontend: Display in hint-section
```

## 10. Complete Request/Response Cycle

### Successful Query Execution
```
Time: t=0ms    User clicks "Execute Query"
       0-50ms  Frontend validation and state update
       50ms    HTTP POST sent
       50-100ms Backend receives and validates
       100-200ms PostgreSQL executes query
       200-250ms MongoDB saves attempt
       250ms    Response sent back
       250-300ms Frontend processes response and updates state
       300ms+   User sees results in UI
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│              Browser / Frontend                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  React Component: AssignmentAttempt             │ │
│  │  - Manages component state (query, results)    │ │
│  │  - Renders editor, results panel               │ │
│  │  - Handles user interactions                   │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Monaco Editor                                  │ │
│  │  - Syntax highlighting                         │ │
│  │  - Code completion                             │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Axios HTTP Client                              │ │
│  │  - Makes POST requests to backend API          │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────┘
           │ JSON over HTTP
           │
┌──────────▼───────────────────────────────────────────┐
│             Backend / Server                         │
│  ┌────────────────────────────────────────────────┐ │
│  │  Express.js Server                             │ │
│  │  - Routes requests to controllers              │ │
│  │  - Applies middleware (CORS, validation)       │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Controllers                                    │ │
│  │  - executeUserQuery()                          │ │
│  │  - Handles business logic                      │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Services                                       │ │
│  │  - queryService: execution logic              │ │
│  │  - llmService: hint generation                │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬─────────────────────┬────────────────────┘
           │                       │
    ┌──────▼──────┐        ┌──────▼──────┐
    │ PostgreSQL  │        │  MongoDB    │
    │  Sandbox    │        │ Persistence │
    │  Database   │        │  Database   │
    └─────────────┘        └─────────────┘
           │ SQL                │ JSON
           │ Queries            │ Documents
           │ Results            │ User Attempts
    Sample Data        Assignments & Tracking
```

---

## Data Structures

### Query Execution Request
```
{
  query: string,           // SQL query from user
  assignmentId: string,    // MongoDB ObjectId
  userId: string           // User identifier (optional)
}
```

### Query Result Structure
```
{
  rows: Array<Object>,     // Array of result rows
  rowCount: number,        // Total rows returned
  columns: string[],       // Column names
  message: string,         // Success/info message
  executionTime?: number   // Query execution time in ms
}
```

### User Attempt Document (MongoDB)
```
{
  _id: ObjectId,
  userId: string,
  assignmentId: ObjectId,
  query: string,
  result: mixed,
  status: 'success' | 'error' | 'pending',
  executedAt: Date
}
```

### Assignment Document (MongoDB)
```
{
  _id: ObjectId,
  title: string,
  description: string,
  difficulty: 'easy' | 'medium' | 'hard',
  question: string,
  expectedColumns: string[],
  hints: string[],
  sampleData: {
    tables: string[],
    description: string
  },
  solution: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

This data flow diagram demonstrates the complete journey of a user's SQL query from click to result, including all validation layers, database operations, and state management.
