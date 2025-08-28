import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
  getExpenseChartData
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer disk storage for expense documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    // Save under backend/uploads (served via /uploads)
    const folder = path.join(process.cwd(), 'uploads', `${yyyy}-${mm}-${dd}`);
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}-${safeOriginal}`);
  }
});

const upload = multer({ storage });

// All routes are protected
router.use(protect);

// Fixed-path routes MUST come before dynamic ":id" routes
// Statistics and charts
router.get('/stats', getExpenseStats);
router.get('/chart-data', getExpenseChartData);

// Expense CRUD operations
router.route('/')
  .get(getExpenses)
  .post(upload.array('documents', 10), createExpense);

// Expense item operations
router.route('/:id/items')
  .post(addExpenseItem);

router.route('/:id/items/:itemId')
  .put(updateExpenseItem)
  .delete(deleteExpenseItem);

// Dynamic id routes after all fixed paths
router.route('/:id')
  .get(getExpense)
  .put(upload.array('documents', 10), updateExpense)
  .delete(deleteExpense);

export default router;
