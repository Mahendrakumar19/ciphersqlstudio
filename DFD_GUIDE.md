# 📊 Data Flow Diagram - CipherSQLStudio

## How to Use This Diagram

### Option 1: StarUML Online
1. Go to: https://www.planttext.com/
2. Copy the code from `DFD_DIAGRAM.puml`
3. Paste it in the left panel
4. Click "Export" → "PNG" to download

### Option 2: StarUML Desktop App
1. Download from: https://staruml.io/
2. File → New → Select "Flowchart"
3. Recreate diagram using the description below
4. Export as PNG/SVG

### Option 3: Draw.io Online
1. Go to: https://app.diagrams.net/
2. Create → Flowchart
3. Draw using the structure below

---

## Simplified DFD (Easy to Draw by Hand)

```
┌──────────────┐
│    USER      │
└──────┬───────┘
       │ Requests
       ▼
┌────────────────────────────────┐
│   FRONTEND (React - Vercel)    │
│  - Assignment List             │
│  - SQL Editor (Monaco)         │
│  - Results Display             │
└──────┬─────────────────────────┘
       │ HTTP/REST API
       │ https://ciphersqlstudio-zc5r.onrender.com
       ▼
┌────────────────────────────────────────────────┐
│    BACKEND (Express - Render)                  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Controllers:                            │ │
│  │  • Assignment endpoints                 │ │
│  │  • Query execution endpoint              │ │
│  │  • Hint generation endpoint             │ │
│  └──────────────────────────────────────────┘ │
│                    │                          │
│                    ▼                          │
│  ┌──────────────────────────────────────────┐ │
│  │  Services:                               │ │
│  │  • Query Validator & Executor           │ │
│  │  • LLM Hint Service                     │ │
│  │  • Assignment Manager                   │ │
│  └──────────────────────────────────────────┘ │
│                    │                          │
│                    ▼                          │
│  ┌──────────────────────────────────────────┐ │
│  │  Cache & Queue:                          │ │
│  │  • Hint Cache (10-min TTL)               │ │
│  │  • Request Queue (2-sec delays)          │ │
│  └──────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
 ┌────────┐ ┌─────────┐  ┌──────────┐
 │MongoDB │ │Postgres │  │LLM Chain │
 │(Cloud) │ │(Local)  │  │          │
 └────────┘ └─────────┘  └──────────┘
      │          │          │
      │ Store/   │Execute   │Try
      │ Read     │ Queries  │OpenAI
      │ Assign-  │(SELECT)  │  ↓
      │ ments    │Results   │Try
      │ & Hints  │capped    │Gemini
      │          │@ 500     │  ↓
      │          │rows      │Use
      │          │          │Local
      │          │          │DB
      └────┬─────┴──────┬───┘
           │ Data       │ Response
           │            │
           └────┬───────┘
                │
                ▼
        ┌──────────────┐
        │   FRONTEND   │
        │ Display Data │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │    USER      │
        └──────────────┘
```

---

## Detailed Data Flows

### 1. **Assignment List Loading Flow**
```
User Opens App
    ↓
Frontend: GET /api/assignments
    ↓
Backend: Fetch from MongoDB
    ↓
MongoDB: Return 6 assignments
    ↓
Frontend: Display in list
    ↓
User: Click on assignment
```

### 2. **Hint Generation Flow** (Most Important)
```
User Clicks "Get Hint"
    ↓
Frontend: POST /api/hint {question, code, error}
    ↓
Backend LLM Service:
    ├─ Check Hint Cache
    │   └─ HIT? → Return cached hint
    │
    └─ MISS? → Add to Request Queue
        ├─ Wait 2 seconds (rate limiting)
        │
        ├─ Try OpenAI API (Cost: $0.005 per call)
        │   ├─ Success? → Cache + Return
        │   └─ Fail (429)? → Next
        │
        ├─ Try Gemini API (Cost: Free tier)
        │   ├─ Success? → Cache + Return
        │   └─ Fail? → Next
        │
        └─ Use Local Database (Cost: $0)
            └─ Return pre-written hint
    ↓
Frontend: Display hint
```

### 3. **SQL Query Execution Flow**
```
User Types SQL → Clicks Execute
    ↓
Frontend: POST /api/query/execute {query}
    ↓
Backend Query Service:
    ├─ Validate Query (Allowlist: SELECT, WITH, EXPLAIN)
    │   └─ Invalid? → Return error
    │
    ├─ Execute with 5-second timeout
    │
    ├─ Limit results to 500 rows
    │
    └─ Return results
    ↓
Frontend: Display results table
```

---

## System Components

### Data Sources (External Systems)
- **MongoDB Atlas**: Cloud database (Assignments, User attempts, Cached hints)
- **PostgreSQL**: Local/sandboxed SQL execution environment
- **OpenAI API**: Primary LLM for hints
- **Gemini API**: Fallback LLM
- **Local Database**: 10+ pre-written hints (cost-free fallback)

### Processing Centers (Backend Services)
- **Assignment Controller**: Routes for fetching assignments
- **Query Controller**: Routes for executing SQL queries
- **Hint Controller**: Routes for getting hints
- **Query Service**: SQL validation + execution
- **LLM Service**: Manages hint generation with fallback chain
- **Cache**: Stores hints for 10 minutes to reduce API calls
- **Queue**: Implements 2-second delays between requests

### Data Stores
- **MongoDB**: Persistent data (read-heavy)
- **PostgreSQL**: Query sandbox (write during user execution)
- **In-memory Cache**: Fast hint retrieval
- **Local Hints**: Zero-cost fallback

---

## Key Design Decisions

✅ **Separation of Concerns**
- PostgreSQL: Purely for query execution (sandboxed)
- MongoDB: Only for persistent user data (assignments, attempts)
- Clear layer separation (Controllers → Services → Databases)

✅ **Cost Optimization**
- Hint caching reduces OpenAI calls by 90%+
- Request queuing prevents burst API calls
- Automatic fallback to local DB (no cost)

✅ **Security**
- All user inputs validated before DB interaction
- SQL injection prevention via allowlist + parameterized queries
- Query timeout prevents runaway queries
- CORS restricted to frontend domain only

✅ **Scalability**
- Connection pooling for databases
- Stateless backend (can run multiple instances)
- Lazy loading of Monaco Editor
- Results capped to prevent large transfers

---

## How to Import PlantUML Code

### Step 1: Copy the PlantUML Code
From `DFD_DIAGRAM.puml` file in the repo

### Step 2: Paste into PlantText
1. Visit: https://www.planttext.com/
2. Paste the code
3. Diagram renders automatically

### Step 3: Export
- PNG: Right-click → Save Image
- SVG: Edit → Export SVG

Or use any online PlantUML renderer:
- https://kroki.io/
- https://app.diagrams.net/ (import PlantUML)
- https://mermaid.live/ (for Mermaid format)

---

## Integration Points

| Component | Integration | Protocol | Format |
|-----------|-------------|----------|--------|
| Frontend → Backend | HTTP | HTTPS | JSON |
| Backend → MongoDB | Mongoose driver | Native | BSON |
| Backend → PostgreSQL | pg library | Native | SQL |
| Backend → OpenAI | REST API | HTTPS | JSON |
| Backend → Gemini | REST API | HTTPS | JSON |

