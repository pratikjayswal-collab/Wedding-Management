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
  uploadExpenseProof,
  downloadExpenseProof
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Expense CRUD operations
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

// Expense item operations
router.route('/:id/items')
  .post(addExpenseItem);

router.route('/:id/items/:itemId')
  .put(updateExpenseItem)
  .delete(deleteExpenseItem);

// Statistics and charts
router.get('/stats', getExpenseStats);
router.get('/chart-data', getExpenseChartData);

// Proof upload and download
router.post('/:id/proof', uploadProof.single('proof'), uploadExpenseProof);
router.get('/:id/proof', downloadExpenseProof);

export default router;
