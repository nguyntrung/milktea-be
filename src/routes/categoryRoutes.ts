import express from 'express';
import categoryController from '../controllers/categoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin-only routes
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id/deactivate', protect, adminOnly, categoryController.deactivate);

export default router;
