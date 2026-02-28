# CipherSQLStudio - Developer Quick Reference

## 🚀 Quick Start (2 Minutes)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (wait for backend to start)
cd frontend
npm install
npm run dev
```

**Visit**: http://localhost:5173

## 📋 Folder Structure Quick Map

```
frontend/
├── src/pages/              # Main pages (routing)
├── src/components/         # Reusable components
├── src/api/               # API client & endpoints
├── src/styles/            # SCSS files (mobile-first)
└── index.html

backend/
├── src/controllers/       # Request handlers
├── src/services/          # Business logic
├── src/db/               # Database setup
├── src/routes/           # API routes
└── src/index.ts          # Server entry
```

## 🔑 Key Ports

- Frontend: **5173** (Vite dev server)
- Backend: **5000** (Express server)
- PostgreSQL: **5432** (localhost)
- MongoDB: (cloud or localhost:27017)

## 🛠️ Common Commands

### Backend
```bash
npm run dev              # Start with nodemon
npm run build            # Compile TypeScript
npm run seed             # Seed MongoDB
npm start                # Run compiled JS
```

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
```

## 📂 Adding a New Assignment

Edit `backend/src/db/seed.ts`:
```typescript
{
  title: 'Assignment Name',
  description: 'What it teaches',
  difficulty: 'easy' | 'medium' | 'hard',
  question: 'What should students do?',
  expectedColumns: ['col1', 'col2'],
  hints: ['Hint 1', 'Hint 2'],
  sampleData: { tables: ['table1'], description: '...' },
  solution: 'SELECT ...'
}
```

Then:
```bash
cd backend
npm run seed
```

## 📝 Key Files to Know

### Frontend
- `frontend/src/pages/AssignmentList.tsx` - Assignment listing
- `frontend/src/pages/AssignmentAttempt.tsx` - Main editor
- `frontend/src/api/assignments.ts` - API calls
- `frontend/src/styles/main.scss` - Global styles

### Backend
- `backend/src/index.ts` - Server setup
- `backend/src/controllers/assignmentController.ts` - Request handlers
- `backend/src/services/queryService.ts` - SQL execution
- `backend/src/services/llmService.ts` - Hint generation

## 🌐 API Quick Reference

### Get Assignments
```bash
GET http://localhost:5000/api/assignments
```

### Execute Query
```bash
POST http://localhost:5000/api/query/execute
{
  "query": "SELECT * FROM users;",
  "assignmentId": "xxx",
  "userId": "anonymous"
}
```

### Get Hint
```bash
POST http://localhost:5000/api/hint
{
  "question": "Assignment question text",
  "attemptedQuery": "SELECT * FROM users;",
  "error": null
}
```

### Get Table Schema
```bash
GET http://localhost:5000/api/query/schema/users
```

### Get Sample Data
```bash
GET http://localhost:5000/api/query/sample/users?limit=10
```

## 🎨 SCSS Structure

### Main Variables (main.scss)
```scss
$primary-color: #6366f1
$secondary-color: #8b5cf6
$success-color: #10b981
$danger-color: #ef4444

// Breakpoints
$mobile: 320px
$tablet: 641px
$desktop: 1024px
$large-desktop: 1281px
```

### Common Mixins
```scss
@include flex-center              // Center flex
@include flex-between             // Space-between
@include button-base              // Button styling
@include card-base                // Card styling
@include responsive-padding       // Responsive padding
```

### BEM Naming Example
```scss
.query-results {                  // Block
  &__header { }                   // Element
  &__table { }                    // Element
  &--loading { }                  // Modifier
  
  &__row {
    &--highlighted { }            // Nested modifier
  }
}
```

## 🐛 Debugging Tips

### Frontend
```typescript
// Check browser console (F12)
// Use Redux/React DevTools
// Check Network tab for API calls

// Add logging
console.log('State:', { query, results })
```

### Backend
```bash
# Check server logs
npm run dev

# Check requests
curl http://localhost:5000/api/health

# Test database
psql -U postgres -d ciphersql_sandbox
SELECT * FROM users;
```

## ⚙️ Environment Variables

### Backend (.env)
```
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
MONGO_URI=mongodb://localhost
OPENAI_API_KEY=sk-...
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🔄 Development Workflow

1. **Make changes** to code
2. **Frontend**: Refresh browser (auto hot-reload)
3. **Backend**: Restart with Ctrl+C and `npm run dev`
4. **Test API**: Use curl or Postman
5. **Check errors**: Console logs and DevTools
6. **Commit**: `git commit -m "descriptive message"`

## 📦 Key Dependencies

### Frontend
- react 18
- react-router-dom 6
- @monaco-editor/react
- axios
- typescript
- vite
- sass

### Backend
- express
- pg (PostgreSQL)
- mongoose (MongoDB)
- axios
- typescript
- ts-node
- nodemon

## 🧪 Quick Test Checklist

- [ ] Backend runs: `npm run dev`
- [ ] GET /api/health returns OK
- [ ] Frontend loads: http://localhost:5173
- [ ] See assignment list
- [ ] Click assignment
- [ ] Execute: `SELECT * FROM users;`
- [ ] See results table
- [ ] Click "Get Hint"
- [ ] See hint text
- [ ] Test error: `DELETE FROM users;`
- [ ] See error message

## 📱 Responsive Design Testing

```bash
# Ctrl+Shift+M in browser DevTools

# Mobile: 320px
# Tablet: 641px
# Desktop: 1024px
# Large: 1281px+
```

## 💾 Database Backup

```bash
# PostgreSQL
pg_dump -U postgres ciphersql_sandbox > backup.sql
psql -U postgres ciphersql_sandbox < backup.sql

# MongoDB (via Atlas UI or local backup)
```

## 🚀 Deploy Checks

Before deploying:
- [ ] `npm run build` completes without errors
- [ ] Environment variables set correctly
- [ ] Database connections tested
- [ ] LLM API key valid
- [ ] Tests pass
- [ ] No console errors

## 📖 Documentation Links

- **Setup**: QUICK_START.md
- **Architecture**: DATA_FLOW.md
- **Deployment**: DEPLOYMENT.md
- **Contributing**: CONTRIBUTING.md
- **Full Docs**: README.md

## 🆘 Common Issues & Solutions

### "Cannot find module"
```bash
cd backend (or frontend)
npm install
```

### "Port already in use"
```bash
# Change PORT in .env
# Or kill process: lsof -ti:5000 | xargs kill -9
```

### "MongoDB connection failed"
- Check MONGODB_URI in .env
- Verify IP whitelist in Atlas
- Check network connectivity

### "PostgreSQL connection failed"
- Verify pg is running: `psql -U postgres`
- Check credentials in .env
- Create database: `createdb ciphersql_sandbox`

### "LLM errors"
- Check API key validity
- Verify account has credits
- Review rate limits
- Check error message in logs

## 📞 Quick Support

1. Check errors in console
2. Review relevant documentation
3. Check backend logs
4. Verify environment variables
5. Restart services
6. Check GitHub issues

---

**Last Updated**: February 25, 2026
**Status**: ✅ Ready for Development
