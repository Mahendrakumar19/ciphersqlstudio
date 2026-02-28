# Contributing to CipherSQLStudio

Thank you for your interest in contributing! This guide will help you get started.

## Current Needs

### Priority Features
- [ ] User authentication system
- [ ] Query attempt history
- [ ] Progress tracking
- [ ] More SQL assignments
- [ ] Query optimization suggestions
- [ ] Student performance analytics

### Bug Fixes & Improvements
- Visual editor enhancements
- Mobile UI refinements
- Performance optimizations
- Additional LLM providers
- Query complexity analysis

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- MongoDB
- Git

### Setup Development Environment

1. **Fork and clone**
   ```bash
   git clone https://github.com/your-fork/ciphersqlstudio.git
   cd ciphersqlstudio
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow development setup**
   - See [QUICK_START.md](QUICK_START.md)

## Code Style Guidelines

### TypeScript
- Use strict mode
- Add type annotations for all functions
- Use interfaces over types when possible
- Avoid `any` type

Example:
```typescript
interface QueryOptions {
  timeout: number
  limit: number
}

const executeQuery = (query: string, options: QueryOptions): Promise<Result> => {
  // implementation
}
```

### React Components
- Functional components with hooks
- Props interfaces for all components
- Meaningful component names
- Keep components focused and small

Example:
```typescript
interface QueryResultsProps {
  results: QueryResult
  onClear: () => void
}

const QueryResults: React.FC<QueryResultsProps> = ({ results, onClear }) => {
  // implementation
}
```

### SCSS
- Use variables from main.scss
- Follow BEM naming: `.component__element--modifier`
- Use mixins for common patterns
- Mobile-first responsive design

Example:
```scss
.query-results {
  @include card-base;
  
  &__table {
    width: 100%;
  }
  
  &__table-cell {
    padding: 0.5rem;
  }
  
  &__table-cell--header {
    background-color: $primary-color;
    color: white;
  }
}
```

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues: "Fix #123: User query validation"

Example:
```
Add query execution timeout configuration

- Implement configurable query timeout
- Add timeout error handling
- Update ENV documentation
```

## Pull Request Process

1. **Keep PRs focused**
   - One feature or fix per PR
   - Maximum ~400 lines of changes

2. **Test locally**
   ```bash
   # Frontend
   cd frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

3. **Update documentation**
   - Add comments for complex logic
   - Update README if needed
   - Document new APIs

4. **Create PR with template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   
   ## Testing
   How was this tested?
   
   ## Checklist
   - [ ] Tested locally
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

## Adding New Assignments

### Steps

1. **Add to seed.ts**
   ```typescript
   {
     title: 'Assignment Title',
     description: 'Brief description',
     difficulty: 'easy' | 'medium' | 'hard',
     question: 'What should students do?',
     expectedColumns: ['col1', 'col2'],
     hints: [
       'First hint',
       'Second hint'
     ],
     sampleData: {
       tables: ['users', 'posts'],
       description: 'What data is available'
     },
     solution: 'SELECT col1, col2 FROM table;'
   }
   ```

2. **Seed locally**
   ```bash
   cd backend
   npm run seed
   ```

3. **Test in UI**
   - Verify assignment shows in list
   - Test hint generation
   - Verify solution works

## Adding New Features

### Backend Feature Example: New Query Validator

1. **Create service**
   ```typescript
   // src/services/validatorService.ts
   export const validateComplexity = (query: string): ValidationResult => {
     // implementation
   }
   ```

2. **Add to controller**
   ```typescript
   // In executeUserQuery
   const complexity = validateComplexity(query)
   if (complexity.isComplex) {
     // warn user
   }
   ```

3. **Add API endpoint**
   ```typescript
   // In assignmentRoutes.ts
   router.post('/validate-complexity', async (req, res) => {
     // implementation
   })
   ```

4. **Test and document**

### Frontend Feature Example: Query History

1. **Create component**
   ```typescript
   // src/components/QueryHistory.tsx
   const QueryHistory: React.FC<Props> = ({ queries }) => {
     // implementation
   }
   ```

2. **Add styles**
   ```scss
   // src/styles/components/queryHistory.scss
   .query-history {
     // styles
   }
   ```

3. **Integrate into page**
   ```typescript
   // In AssignmentAttempt.tsx
   <QueryHistory queries={queryHistory} onSelect={handleSelect} />
   ```

## Testing Guidelines

### Manual Testing
- Test all happy paths
- Test error cases
- Test on different screen sizes
- Test with different LLM providers

### Areas to Test

**Frontend:**
- [ ] Page loads for all routes
- [ ] Can execute valid queries
- [ ] Error messages display correctly
- [ ] Mobile responsive layout
- [ ] Hint button works
- [ ] Results table displays correctly

**Backend:**
- [ ] GET /api/health returns OK
- [ ] GET /api/assignments returns list
- [ ] POST /api/query/execute works
- [ ] Invalid queries rejected
- [ ] Dangerous queries blocked
- [ ] LLM integration works

**Database:**
- [ ] PostgreSQL connects
- [ ] Sample data exists
- [ ] MongoDB connects
- [ ] Assignments can be queried

## Debugging Tips

### Frontend Debugging
```typescript
// Add console logs
console.log('State:', { query, results, error })

// Use React DevTools
// Chrome/Firefox extension: React Developer Tools

// Inspect network calls
// DevTools → Network tab → Check API requests
```

### Backend Debugging
```typescript
// Add console logs
console.log('Query:', query)
console.log('Validation:', validation)

// Use debugger
// Run: node --inspect dist/index.js
// Visit: chrome://inspect
```

### Database Debugging
```bash
# PostgreSQL
psql -U postgres -d ciphersql_sandbox
SELECT * FROM users;

# MongoDB
mongosh
use ciphersqlstudio
db.assignments.find().pretty()
```

## Common Tasks

### Add new environment variable
1. Add to `.env.example`
2. Add to deployment docs
3. Use in code: `process.env.YOUR_VAR`
4. Add type if needed

### Update database schema
1. Modify schema in `models/schemas.ts`
2. Create migration if needed
3. Test with fresh database
4. Document changes

### Add new API endpoint
1. Create route: `routes/newRoutes.ts`
2. Create controller: `controllers/newController.ts`
3. Create service if needed: `services/newService.ts`
4. Add to main `index.ts`
5. Document in README

## Performance Improvements

### Frontend Optimization
- Use React.memo for expensive components
- Implement useCallback for event handlers
- Lazy load routes with React.lazy
- Optimize SCSS selectors

### Backend Optimization
- Add database indexes
- Implement query caching
- Use connection pooling
- Add rate limiting

## Documentation

### Code Comments
```typescript
// Good: Explains why, not what
// Timeout queries to prevent long-running operations from blocking
const QUERY_TIMEOUT = 5000

// Avoid: Obvious what the code does
// Add 1 to count
count += 1
```

### Function Documentation
```typescript
/**
 * Execute SQL query with validation and timeout
 * @param query - SQL query string
 * @returns Query results or error
 * @throws Error if query is invalid or times out
 */
export const executeQuery = async (query: string): Promise<QueryResult> => {
  // implementation
}
```

## Community

- **Questions?** Open a GitHub issue
- **Discussion?** Use GitHub Discussions
- **Found a bug?** Create an issue with reproduction steps
- **Have an idea?** Start a discussion before building

## Code of Conduct

Be respectful, inclusive, and supportive. We're here to learn together!

---

Thank you for contributing to CipherSQLStudio! 🎉
