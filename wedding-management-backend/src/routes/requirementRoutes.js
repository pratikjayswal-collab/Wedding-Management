import express from 'express';
import {
  getRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  toggleRequirementStatus,
  bulkUpdateRequirementStatus,
  getRequirementsByStatus,
  getRequirementStats
} from '../controllers/requirementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Requirement CRUD operations
router.route('/')
  .get(getRequirements)
  .post(createRequirement);

// Stats route (must come before /:id routes)
router.get('/stats', getRequirementStats);

// Special requirement operations
router.patch('/bulk-status', bulkUpdateRequirementStatus);
router.get('/status/:status', getRequirementsByStatus);

router.route('/:id')
  .get(getRequirement)
  .put(updateRequirement)
  .delete(deleteRequirement);

// Special requirement operations
router.patch('/:id/status', toggleRequirementStatus);

export default router;
