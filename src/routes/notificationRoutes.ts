import express from 'express';
import notificationController from '../controllers/notificationController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public or protected depending on app logic
router.get('/', protect, notificationController.getAll);
router.get('/:id', protect, notificationController.getById);
router.get('/user/:userId', protect, notificationController.getByUser);

// Admin or internal system can use
router.post('/', adminOnly, protect, notificationController.create);

// Đánh dấu đã đọc
router.patch('/:id/read', protect, notificationController.markAsRead);

export default router;
