import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  getExpenseStats,
  getExpenseChartData,
  downloadProofDocument,
  deleteProofDocument
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProofDocument, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Expense CRUD operations
router.route('/')
  .get(getExpenses)
  .post(uploadProofDocument.single('proofDocument'), handleUploadError, createExpense);

router.route('/:id')
  .get(getExpense)
  .put(uploadProofDocument.single('proofDocument'), handleUploadError, updateExpense)
  .delete(deleteExpense);

// Expense item operations
router.route('/:id/items')
  .post(addExpenseItem);

router.route('/:id/items/:itemId')
  .put(updateExpenseItem)
  .delete(deleteExpenseItem);

// Proof document operations
router.route('/:id/proof')
  .get(downloadProofDocument)
  .delete(deleteProofDocument);

// Statistics and charts
router.get('/stats', getExpenseStats);
router.get('/chart-data', getExpenseChartData);

export default router;
