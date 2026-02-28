# CipherSQLStudio

A browser-based SQL learning platform where students practice SQL queries against pre-configured assignments with real-time execution and intelligent hints powered by LLM.

## 🎯 Features

### Core Features (90%)
- **Assignment Listing**: Browse available SQL assignments with difficulty levels
- **Assignment Interface**: View question, sample data, and write queries
- **SQL Editor**: Monaco Editor for writing SQL queries with syntax highlighting
- **Real-time Results**: Execute queries and view formatted results immediately
- **LLM Hints**: Get intelligent hints (not solutions) using OpenAI or Gemini APIs
- **Query Execution Engine**: Secure query execution against PostgreSQL with validation
- **Sample Data Viewer**: Browse table schemas and sample data for reference

### Optional Features (10%)
- User authentication system (ready to implement)
- Save query attempts to MongoDB for tracking

## 📋 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Editor**: Monaco Editor
- **Styling**: SCSS (mobile-first responsive)
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Sandbox DB**: PostgreSQL (for SQL practice)
- **Persistence DB**: MongoDB (for user data)
- **LLM Integration**: OpenAI / Google Gemini

### Architecture
```
┌─────────────────────────────────────┐
│        React Frontend (Vite)        │
│  - Assignment List                  │
│  - Code Editor (Monaco)             │
│  - Results Display                  │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│       Express Backend                │
│  - Query Execution Service           │
│  - LLM Integration Service           │
│  - Assignment Management             │
└──┬────────────────────┬──────────────┘
   │                    │
   ▼                    ▼
┌──────────────┐  ┌──────────────────┐
│ PostgreSQL   │  │    MongoDB       │
│ (Sandbox)    │  │   (Persistence)  │
└──────────────┘  └──────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- MongoDB (local or Atlas)
- LLM API Key (OpenAI or Gemini)

### Installation

1. **Clone the repository**
```bash
git clone <repository>
cd ciphersqlstudio
```

2. **Backend Setup**
```bash
cd backend
npm install

# Copy environment file
cp ../.env.example .env

# Edit .env with your configuration
# - PostgreSQL credentials
# - MongoDB connection string
# - LLM API key
nano .env

# Start backend
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Copy environment file
cp .env.example .env

# Start frontend dev server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🔧 Environment Configuration

### Backend (.env)
```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=ciphersql_sandbox

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# LLM Configuration (choose one)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...

# Security
JWT_SECRET=your_secret_key
QUERY_TIMEOUT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=CipherSQLStudio
```

## 📁 Project Structure

```
ciphersqlstudio/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryResults.tsx
│   │   │   └── SampleDataViewer.tsx
│   │   ├── pages/
│   │   │   ├── AssignmentList.tsx
│   │   │   └── AssignmentAttempt.tsx
│   │   ├── styles/
│   │   │   ├── main.scss
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── assignmentController.ts
│   │   ├── services/
│   │   │   ├── queryService.ts
│   │   │   └── llmService.ts
│   │   ├── models/
│   │   │   └── schemas.ts
│   │   ├── routes/
│   │   │   └── assignmentRoutes.ts
│   │   ├── middleware/
│   │   ├── db/
│   │   │   └── postgres.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── start-backend.bat
├── start-frontend.bat
└── README.md
```

## 🗄️ Database Setup

### PostgreSQL Sample Tables
The system automatically creates and seeds sample tables on first run:
- `users` - User profiles
- `posts` - Blog posts
- `comments` - Post comments

### MongoDB Collections
- `assignments` - SQL learning assignments
- `userattempts` - User query attempts and results

## 🌐 API Endpoints

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get specific assignment

### Query Execution
- `POST /api/query/execute` - Execute SQL query
- `GET /api/query/schema/:tableName` - Get table schema
- `GET /api/query/sample/:tableName` - Get sample table data

### LLM Integration
- `POST /api/hint` - Get hint for question

### User Tracking
- `GET /api/attempts` - Get user attempts

## 🧠 LLM Integration

### Hint Generation
The system uses prompt engineering to ensure LLM provides hints, NOT solutions:

**Key Guidelines:**
- Never provide complete solution queries
- Guide students toward the correct approach
- Suggest relevant SQL concepts (JOIN, GROUP BY, WHERE)
- Point out logical errors without giving answers
- Keep hints concise and focused

**Example Prompt:**
```
You are a SQL learning assistant. Help students with hints, NOT complete solutions.
- Never provide complete queries
- Suggest which SQL concepts to use
- Ask clarifying questions about their approach
- Point out errors without solving them
```

## 🎨 Styling Approach

### Mobile-First Responsive Design
- **Mobile**: 320px
- **Tablet**: 641px
- **Desktop**: 1024px
- **Large Desktop**: 1281px+

### SCSS Features Used
- Variables for colors, spacing, breakpoints
- Mixins for common patterns (flex-center, button-base, card-base)
- Nesting for organized selectors
- Partials for modular styles
- BEM-like naming conventions

### Responsive Features
- Touch-friendly UI elements
- Flexible grid layouts
- Adaptive panel sizing
- Scrollable containers
- Collapsible sections

## 🔒 Query Security

### Validation & Sanitization
1. Only SELECT queries allowed
2. Block dangerous keywords: DROP, DELETE, INSERT, UPDATE, TRUNCATE, ALTER, CREATE
3. Query timeout: 5 seconds (configurable)
4. Parameterized queries for safety
5. Error handling without exposing database details

## 📊 Data Flow Diagram

See `DATA_FLOW.md` for complete data flow from user interaction to result display.

**Quick Flow:**
```
1. User clicks "Execute Query"
2. Frontend validates query locally
3. Sends POST to /api/query/execute
4. Backend validates query
5. Executes against PostgreSQL
6. Returns results or error
7. Frontend displays in Results Panel
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Load assignment list
- [ ] Click assignment to view details
- [ ] Execute sample query
- [ ] View query results in table
- [ ] Request hint from LLM
- [ ] Test error handling (invalid query)
- [ ] Test responsive design on mobile
- [ ] Test sample data viewer

## 🚢 Deployment

### Vercel (Frontend)
```bash
npm run build
# Deploy ./dist folder to Vercel
```

### Heroku (Backend)
```bash
heroku create ciphersqlstudio-api
git push heroku main
heroku config:set POSTGRES_HOST=...
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow BEM naming in SCSS
- Component-based architecture
- Separation of concerns (controllers, services, models)

### Git Workflow
```bash
git checkout -b feature/feature-name
# Make changes
git push origin feature/feature-name
# Create Pull Request
```

## 🐛 Troubleshooting

### PostgreSQL Connection Failed
- Verify PostgreSQL is running
- Check credentials in .env
- Ensure database exists

### MongoDB Connection Failed
- Verify MongoDB URI in .env
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your machine

### LLM API Errors
- Verify API key is valid
- Check API usage limits
- Review error message from LLM provider

### Query Execution Timeout
- Optimize SQL query
- Increase QUERY_TIMEOUT in .env
- Check PostgreSQL performance

## 📚 Learning Resources

- [SQL Tutorial](https://www.w3schools.com/sql/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Monaco Editor Docs](https://github.com/microsoft/monaco-editor)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

MIT License. See LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please follow the development guidelines and ensure tests pass before submitting PR.

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check GitHub issues
4. Contact maintainers

---

Built with ❤️ for SQL learners everywhere.
