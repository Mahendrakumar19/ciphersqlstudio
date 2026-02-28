import pool from '../db/postgres';

interface QueryValidationResult {
  isValid: boolean;
  error?: string;
}

interface QueryResultData {
  rows: any[];
  rowCount: number | null;
  fields?: any[];
  executionTime?: number;
}

// Basic SQL validation to prevent malicious queries
export const validateQuery = (query: string): QueryValidationResult => {
  const upperQuery = query.toUpperCase().trim();
  
  // Only allow SELECT queries
  if (!upperQuery.startsWith('SELECT')) {
    return {
      isValid: false,
      error: 'Only SELECT queries are allowed for learning purposes.'
    };
  }

  // Block dangerous keywords
  const dangerousKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'TRUNCATE', 'ALTER', 'CREATE'];
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return {
        isValid: false,
        error: `${keyword} operations are not permitted in this learning environment.`
      };
    }
  }

  return { isValid: true };
};

export const executeQuery = async (query: string): Promise<QueryResultData> => {
  const validation = validateQuery(query);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const startTime = Date.now();
    
    const result = await Promise.race([
      pool.query(query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 
          parseInt(process.env.QUERY_TIMEOUT || '5000'))
      )
    ]) as any;

    const executionTime = Date.now() - startTime;

    return {
      ...result,
      executionTime
    };
  } catch (error) {
    if (error instanceof Error) {
      // Handle connection refused errors gracefully
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        throw new Error('PostgreSQL database is not available. Query execution is disabled.');
      }
      // Return structured error response
      throw {
        success: false,
        error: error.message,
        details: error.message.includes('timeout') 
          ? 'Query took too long to execute.' 
          : 'Database error occurred.'
      };
    }
    throw error;
  }
};

export const getTableSchema = async (tableName: string) => {
  try {
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching table schema:', error);
    throw error;
  }
};

export const getSampleTableData = async (tableName: string, limit: number = 10) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ${tableName} LIMIT $1;
    `, [limit]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching sample data:', error);
    throw error;
  }
};
