import express from 'express';
import {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  toggleInvitation,
  bulkUpdateInvitation,
  getGuestStats
} from '../controllers/guestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Guest CRUD operations
router.route('/')
  .get(getGuests)
  .post(createGuest);

// Stats route (must come before /:id routes)
router.get('/stats', getGuestStats);

// Special guest operations
router.patch('/bulk-invitation', bulkUpdateInvitation);

router.route('/:id')
  .get(getGuest)
  .put(updateGuest)
  .delete(deleteGuest);

// Special guest operations
router.patch('/:id/invitation', toggleInvitation);

export default router;
