# Quick Start Guide - CipherSQLStudio

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] MongoDB account (Atlas or local)
- [ ] OpenAI or Gemini API key

## Setup Steps

### 1. Clone & Navigate
```bash
cd ciphersqlstudio
```

### 2. Environment Configuration

#### Backend Setup
```bash
cd backend
copy ..\..env.example .env
```

Edit `.env` with:
- PostgreSQL credentials (default: localhost, user: postgres)
- MongoDB connection string
- LLM API key

#### Frontend Setup
```bash
cd ../frontend
copy .env.example .env
```

The defaults should work fine locally.

### 3. Install Dependencies

#### Terminal 1 - Backend
```bash
cd backend
npm install
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
```

### 4. Start Development Servers

#### Backend (Terminal 1)
```bash
npm run dev
```
Expected output:
```
Server running on port 5000
PostgreSQL initialized
Sample data seeded
```

#### Frontend (Terminal 2)
```bash
npm run dev
```
Expected output:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 5. Verify Setup

1. **Backend Health**: Visit `http://localhost:5000/api/health`
   - Should return `{ status: 'OK', timestamp: '...' }`

2. **Frontend**: Visit `http://localhost:5173`
   - Should see assignment list page
   - If empty, MongoDB assignments may not be seeded

### 6. Seed MongoDB with Assignments (Optional)

If assignments aren't showing:
```bash
cd backend
npm run seed
```

Expected output:
```
Connected to MongoDB
Cleared existing assignments
Successfully seeded 6 assignments
1. Basic SELECT Statement (easy)
2. JOIN Multiple Tables (medium)
3. Aggregate Functions (medium)
...
```

## Troubleshooting

### "PostgreSQL connection failed"
- Ensure PostgreSQL is running: `psql -U postgres`
- Check .env credentials match your setup
- Default: `postgres:yourpassword@localhost:5432`

### "MongoDB connection timeout"
- Verify MongoDB connection string in .env
- If using Atlas, check IP whitelist (add 0.0.0.0/0)
- Ensure network access is enabled

### "Port 5000 already in use"
- Change PORT in .env
- Or kill process: `taskkill /F /IM node.exe` (Windows)

### "Assignments not showing"
- Run seed script: `npm run seed` in backend
- Check MongoDB atlas logs
- Verify MONGODB_URI is correct

### "LLM errors"
- Check API key is valid
- Verify account has credits
- Check rate limits
- Ensure endpoint URL is correct

## Quick Commands

### Development
```bash
# Backend
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run seed         # Seed MongoDB

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# PostgreSQL - Connect directly
psql -U postgres -d ciphersql_sandbox

# MongoDB - View in Mongo Compass
# Connection string: mongodb+srv://user:pass@cluster.mongodb.net/ciphersqlstudio
```

## Using Batch Files (Windows)

Simply run:
```bash
start-backend.bat    # Starts backend in separate window
start-frontend.bat   # Starts frontend in separate window
```

## Architecture Summary

```
Frontend (5173)
    ↓
Backend (5000)
    ↓
PostgreSQL (5432) + MongoDB
```

## Next Steps

1. **Run queries**: Navigate to an assignment and execute SQL
2. **Test hints**: Click "Get Hint" to verify LLM integration
3. **Check errors**: Try invalid queries to test validation
4. **Explore code**: Review backend/frontend folders for implementation details

## File Structure Reference

```
ciphersqlstudio/
├── backend/               # Express + Node.js
│   ├── src/
│   │   ├── index.ts      # Main server
│   │   ├── controllers/   # Business logic
│   │   ├── services/      # Query & LLM services
│   │   ├── db/           # Database setup
│   │   └── models/       # MongoDB schemas
│   └── .env              # Configuration
│
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── pages/        # Main pages
│   │   ├── components/   # Reusable components
│   │   ├── styles/       # SCSS files
│   │   └── App.tsx       # Root component
│   └── .env              # API URL config
│
├── README.md             # Full documentation
├── DATA_FLOW.md          # Data flow diagram
└── start-*.bat           # Quick start scripts
```

## Support

- Check README.md for detailed documentation
- Review DATA_FLOW.md for architecture overview
- Check backend/frontend .env.example for all options

Happy learning! 🚀
