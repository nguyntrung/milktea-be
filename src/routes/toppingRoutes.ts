import express from 'express';
import toppingController from '../controllers/toppingController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', toppingController.getAll);
router.get('/:id', toppingController.getById);

// Admin-only routes
router.post('/', protect, authorizeRoles('admin'), toppingController.create);
router.put('/:id', protect, authorizeRoles('admin'), toppingController.update);
router.patch('/:id/deactivate', protect, authorizeRoles('admin'), toppingController.deactivate);
router.delete('/:id', protect, authorizeRoles('admin'), toppingController.delete);

export default router;
