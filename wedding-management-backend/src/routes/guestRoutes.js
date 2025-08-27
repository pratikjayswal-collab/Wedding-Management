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

router.route('/:id')
  .get(getGuest)
  .put(updateGuest)
  .delete(deleteGuest);

// Special guest operations
router.patch('/:id/invitation', toggleInvitation);
router.patch('/bulk-invitation', bulkUpdateInvitation);
router.get('/stats', getGuestStats);

export default router;
