import express from 'express';
import toppingController from '../controllers/toppingController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', toppingController.getAll);
router.get('/:id', toppingController.getById);

// Admin-only routes
router.post('/', toppingController.create);
router.put('/:id', toppingController.update);
router.patch('/:id/deactivate', protect, adminOnly, toppingController.deactivate);

export default router;
