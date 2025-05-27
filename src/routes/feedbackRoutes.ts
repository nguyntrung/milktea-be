import express from 'express';
import FeedbackController from '../controllers/feedbackController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, adminOnly, FeedbackController.create);
router.get('/', protect, adminOnly, FeedbackController.getAll);
router.get('/:id', adminOnly, FeedbackController.getById);
router.patch('/:id/status', adminOnly, FeedbackController.updateStatus);
router.delete('/:id', adminOnly, FeedbackController.delete);

export default router;
