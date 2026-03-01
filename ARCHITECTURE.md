# 🏗️ CipherSQLStudio - System Architecture

## System Overview

CipherSQLStudio is a full-stack MERN application for learning SQL through interactive assignments with LLM-powered intelligent hints.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Vercel)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                          │  │
│  │  - AssignmentList Component                             │  │
│  │  - AssignmentAttempt Component (Monaco Editor)         │  │
│  │  - Responsive SCSS (Mobile First)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │ REST API (HTTPS/CORS)
                         │ https://ciphersqlstudio-zc5r.onrender.com
┌────────────────────────▼───────────────────────────────────────┐
│                   API LAYER (Render - Node.js)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server + TypeScript                         │  │
│  │  Port: 5000                                              │  │
│  │                                                          │  │
│  │  Routes:                                                │  │
│  │  ├─ GET  /api/assignments        (List all)            │  │
│  │  ├─ GET  /api/assignments/:id    (Get single)          │  │
│  │  ├─ POST /api/query/execute      (Run SQL)             │  │
│  │  ├─ POST /api/hint               (Get LLM hint)        │  │
│  │  ├─ GET  /api/query/schema/:table (Table schema)       │  │
│  │  └─ GET  /api/query/sample/:table (Sample data)        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────┘
         ┌──────────────┴───────────────┬──────────────┐
         │                              │              │
┌────────▼──────────┐   ┌──────────────▼──┐   ┌───────▼────────┐
│  SANDBOX DB       │   │ PERSISTENCE DB   │   │  LLM SERVICES  │
│  PostgreSQL       │   │  MongoDB Atlas   │   │                │
│  localhost:5432   │   │  (Cloud)         │   │ ┌────────────┐ │
│                   │   │                  │   │ │ OpenAI API │ │
│  Tables:          │   │  Collections:   │   │ │ (Primary)  │ │
│  ├─ users         │   │  ├─ assignments │   │ └────────────┘ │
│  ├─ posts         │   │  ├─ attempts    │   │ ┌────────────┐ │
│  └─ comments      │   │  └─ users       │   │ │ Gemini API │ │
│                   │   │                  │   │ │(Fallback)  │ │
│  Purpose:         │   │  Purpose:       │   │ └────────────┘ │
│  Query sandbox    │   │  User state     │   │ ┌────────────┐ │
│  & execution      │   │  persistence    │   │ │Local DB    │ │
│                   │   │                  │   │ │(Fallback)  │ │
└───────────────────┘   └──────────────────┘   └────────────────┘
```

## Data Flow

### 1. **Assignment Loading**
```
User → Frontend → API GET /assignments → MongoDB → Frontend displays list
```

### 2. **Getting a Hint**
```
User clicks "Get Hint"
    ↓
Frontend POST /api/hint {question, attemptedQuery, error}
    ↓
Backend checks hint cache (10 min TTL)
    ↓ Cache hit? → Return cached hint
    ↓ Cache miss?
    ↓
Try OpenAI API (with rate limiting queue)
    ↓ Success? → Cache & return
    ↓ Fail (429/401)? 
    ↓
Try Gemini API (with fallback endpoint)
    ↓ Success? → Cache & return
    ↓ Fail?
    ↓
Use Local Hint Database → Cache & return
    ↓
Frontend displays hint to user
```

### 3. **Query Execution** (PostgreSQL mode only)
```
User enters SQL query
    ↓
Frontend POST /api/query/execute {query, assignmentId}
    ↓
Backend validates query (allowlist: SELECT, WITH, EXPLAIN)
    ↓ Invalid? → Return error message
    ↓ Valid?
    ↓
Execute with 5-second timeout
    ↓
Limit results to 500 rows
    ↓
Save attempt to MongoDB
    ↓
Return results to Frontend
    ↓
Frontend displays formatted table
```

## Component Architecture

### Frontend (React)
```
App/
├── pages/
│   ├── AssignmentList.tsx       (Show all assignments)
│   └── AssignmentAttempt.tsx    (Editor interface)
├── components/
│   ├── Header.tsx
│   ├── MonacoEditorWrapper.tsx
│   └── ResultsTable.tsx
├── api/
│   ├── client.ts                 (Axios instance)
│   └── assignments.ts            (API methods)
├── services/
│   └── llmService.ts             (Client-side helpers)
├── styles/
│   ├── global.scss
│   └── assignmentAttempt.scss
└── App.tsx
```

### Backend (Express)
```
src/
├── controllers/
│   └── assignmentController.ts   (Route handlers)
├── services/
│   ├── llmService.ts             (OpenAI, Gemini, Local hints)
│   ├── queryService.ts           (SQL validation & execution)
│   └── hintService.ts            (Caching, queuing)
├── models/
│   └── schemas.ts                (MongoDB schemas)
├── routes/
│   └── assignmentRoutes.ts
├── db/
│   ├── postgres.ts               (PostgreSQL connection pool)
│   └── seed.ts                   (Data seeding script)
├── middleware/
│   └── errorHandler.ts
└── index.ts                      (Express app setup)
```

## Security Features

✅ **SQL Injection Prevention**
- Allowlist validation (only SELECT, WITH, EXPLAIN)
- Regex guards against comment injection (`/* */`, `--`)
- Parameterized queries via pg library
- Per-query 5-second timeout (prevent runaway queries)
- Results capped at 500 rows

✅ **API Security**
- CORS restricted to Vercel frontend only
- Helmet.js for security headers
- Rate limiting on hint requests (2-second queue delays)
- Input validation via express-validator

✅ **LLM Cost Control**
- Hint result caching (10-minute TTL)
- Request queue to prevent burst calls
- Automatic fallback to local DB (zero cost)

✅ **Database Security**
- MongoDB Atlas IP whitelist
- Connection pooling (max 20 clients)
- Environment variables for all credentials

## Deployment

### Frontend (Vercel)
- **URL**: https://ciphersqlstudio-seven.vercel.app
- **Build**: `npm run build` (Vite)
- **Environment**: `.env.production` with `VITE_API_URL`
- **Auto-deployment**: On every GitHub push to `main`

### Backend (Render)
- **URL**: https://ciphersqlstudio-zc5r.onrender.com
- **Build**: `npm run build` (TypeScript compilation)
- **Start**: `node dist/index.js`
- **Environment**: Render environment variables for all secrets
- **Postinstall**: Auto-builds TypeScript after `yarn install`

### Databases
- **PostgreSQL**: Local (development) / Optional (production)
- **MongoDB**: Atlas Cloud (always available)

## API Response Format

All endpoints return consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": {
    "assignments": [...],
    "hint": "...",
    "results": {...}
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional context"
}
```

## Environment Variables

### Backend
```
# Port
PORT=5000
NODE_ENV=production

# PostgreSQL (optional on cloud)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=***
POSTGRES_DB=ciphersql_sandbox

# MongoDB
MONGODB_URI=mongodb+srv://...

# LLM
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-***
GEMINI_API_KEY=AIza***

# Frontend
FRONTEND_URL=https://ciphersqlstudio-seven.vercel.app
```

### Frontend
```
VITE_API_URL=https://ciphersqlstudio-zc5r.onrender.com/api
VITE_APP_TITLE=CipherSQLStudio
```

## Performance Optimizations

✅ **Caching**
- Hint results (10-minute TTL)
- Query results (implicit via browser cache)

✅ **Lazy Loading**
- Monaco Editor only loaded on assignment pages
- Assignments list paginated

✅ **Code Splitting**
- Vite auto-splits vendor bundles
- React Router enables code splitting per route

✅ **Connection Pooling**
- PostgreSQL: 20 concurrent connections max
- MongoDB: Default Mongoose pooling

## Testing

### Local Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Visit http://localhost:5173
```

### API Testing
```bash
# Get assignments
curl https://ciphersqlstudio-zc5r.onrender.com/api/assignments

# Get hint
curl -X POST https://ciphersqlstudio-zc5r.onrender.com/api/hint \
  -H "Content-Type: application/json" \
  -d '{"question":"count all users"}'
```

## Future Enhancements

- 📱 Mobile app (React Native)
- 🎓 User authentication & progress tracking
- 📊 Leaderboard & achievements
- 🎯 Adaptive difficulty based on performance
- 💬 Community discussion forum
- 🧪 Automated test suite validation
