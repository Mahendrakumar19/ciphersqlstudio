import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { Pool } from 'pg';
import mongoose from 'mongoose';
import path from 'path';
import assignmentRoutes from './routes/assignmentRoutes';
import { ensureDatabaseExists, initializeDatabase, seedSampleData } from './db/postgres';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL Connection Pool
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphersqlstudio')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Make connections available
declare global {
  namespace Express {
    interface Request {
      pgPool?: Pool;
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  req.pgPool = pgPool;
  next();
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'CipherSQLStudio API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      assignments: '/api/assignments',
      execute: '/api/query/execute',
      hint: '/api/hint'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api', assignmentRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to initialize PostgreSQL (optional for cloud deployment)
    try {
      await ensureDatabaseExists();
      await initializeDatabase();
      await seedSampleData();
      console.log('✅ PostgreSQL initialized');
    } catch (pgError) {
      console.warn('⚠️ PostgreSQL initialization failed - running in MongoDB-only mode');
      console.warn('Details:', pgError instanceof Error ? pgError.message : pgError);
      console.log('Assignments will still work via MongoDB');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
