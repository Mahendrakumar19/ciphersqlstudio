import { Request, Response } from 'express';
import { Assignment, UserAttempt } from '../models/schemas';
import { executeQuery, getTableSchema as getTableSchemaFromDB, getSampleTableData, validateQuery } from '../services/queryService';
import { generateHint } from '../services/llmService';

export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .select('-solution')
      .sort({ difficulty: 1, createdAt: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id)
      .select('-solution');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment'
    });
  }
};

export const executeUserQuery = async (req: Request, res: Response) => {
  try {
    const { query, assignmentId, userId } = req.body;

    if (!query || !assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Query and assignmentId are required'
      });
    }

    // Validate query
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Execute query
    const result = await executeQuery(query);

    // Save attempt to MongoDB
    const attempt = new UserAttempt({
      userId: userId || 'anonymous',
      assignmentId,
      query,
      result: {
        rows: result.rows,
        rowCount: result.rowCount
      },
      status: 'success'
    });

    await attempt.save();

    res.json({
      success: true,
      data: {
        rows: result.rows,
        rowCount: result.rowCount,
        columns: result.fields?.map(f => f.name) || [],
        message: `Query executed successfully. ${result.rowCount} rows returned.`
      }
    });
  } catch (error: any) {
    // Save failed attempt
    if (req.body.assignmentId) {
      const attempt = new UserAttempt({
        userId: req.body.userId || 'anonymous',
        assignmentId: req.body.assignmentId,
        query: req.body.query,
        result: { error: error.message || error.error },
        status: 'error'
      });
      await attempt.save();
    }

    res.status(400).json({
      success: false,
      error: error.message || error.error || 'Query execution failed'
    });
  }
};

export const getTableSchema = async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const schema = await getTableSchemaFromDB(tableName);

    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch table schema'
    });
  }
};

export const getSampleData = async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const { limit = 10 } = req.query;

    const data = await getSampleTableData(tableName, parseInt(limit as string));

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sample data'
    });
  }
};

export const getHint = async (req: Request, res: Response) => {
  try {
    const { question, attemptedQuery, error } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const hint = await generateHint({
      question,
      attemptedQuery,
      error
    });

    res.json({
      success: true,
      data: hint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate hint'
    });
  }
};

export const getUserAttempts = async (req: Request, res: Response) => {
  try {
    const { userId, assignmentId } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (assignmentId) query.assignmentId = assignmentId;

    const attempts = await UserAttempt.find(query)
      .sort({ executedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attempts'
    });
  }
};
