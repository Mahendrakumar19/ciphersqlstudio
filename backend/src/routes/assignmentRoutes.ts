import { Router } from 'express';
import {
  getAllAssignments,
  getAssignmentById,
  executeUserQuery,
  getTableSchema,
  getSampleData,
  getHint,
  getUserAttempts
} from '../controllers/assignmentController';

const router = Router();

// Assignment routes
router.get('/assignments', getAllAssignments);
router.get('/assignments/:id', getAssignmentById);

// Query execution
router.post('/query/execute', executeUserQuery);
router.get('/query/schema/:tableName', getTableSchema);
router.get('/query/sample/:tableName', getSampleData);

// LLM Hints
router.post('/hint', getHint);

// User attempts
router.get('/attempts', getUserAttempts);

export default router;
