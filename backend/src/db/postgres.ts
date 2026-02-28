import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbName = process.env.POSTGRES_DB || 'ciphersql_sandbox';
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'root',
};

// Main pool used for all queries
const pool = new Pool({ ...dbConfig, database: dbName });

let adminPoolInstance: Pool | null = null;

const getAdminPool = () => {
  if (!adminPoolInstance) {
    adminPoolInstance = new Pool({ ...dbConfig, database: 'postgres' });
  }
  return adminPoolInstance;
};

export const ensureDatabaseExists = async () => {
  const adminPool = getAdminPool();
  const client = await adminPool.connect();
  try {
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (error) {
    console.error('Error checking/creating database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const initializeDatabase = async () => {
  try {
    // Create tables for sample data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id),
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const seedSampleData = async () => {
  try {
    // Clear existing data and reset sequences
    await pool.query('TRUNCATE TABLE comments, posts, users RESTART IDENTITY CASCADE;');

    // Insert sample users
    await pool.query(`
      INSERT INTO users (name, email) VALUES
        ('Alice Johnson', 'alice@example.com'),
        ('Bob Smith', 'bob@example.com'),
        ('Charlie Brown', 'charlie@example.com'),
        ('Diana Prince', 'diana@example.com'),
        ('Eve Wilson', 'eve@example.com');
    `);

    // Insert sample posts
    await pool.query(`
      INSERT INTO posts (user_id, title, content) VALUES
        (1, 'Getting Started with SQL', 'SQL is a powerful language for managing databases...'),
        (2, 'Advanced Query Optimization', 'Learn techniques to optimize your queries...'),
        (1, 'Database Design Best Practices', 'Proper schema design is crucial...'),
        (3, 'Introduction to Joins', 'Joins are essential for querying multiple tables...'),
        (4, 'Understanding Indexes', 'Indexes improve query performance...');
    `);

    // Insert sample comments
    await pool.query(`
      INSERT INTO comments (post_id, user_id, content) VALUES
        (1, 2, 'Great introduction! Very helpful.'),
        (1, 3, 'Thanks for sharing this!'),
        (2, 4, 'Excellent tips on optimization.'),
        (3, 5, 'I learned a lot from this article.'),
        (4, 2, 'Clear explanation of joins.');
    `);

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

export const queryDatabase = async (query: string, params?: any[]) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;

export const closeConnections = async () => {
  try {
    if (adminPoolInstance) {
      await adminPoolInstance.end();
      adminPoolInstance = null;
      console.log('Admin pool closed');
    }
    await pool.end();
    console.log('Main pool closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};
