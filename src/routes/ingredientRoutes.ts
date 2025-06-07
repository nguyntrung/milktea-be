import express from 'express';
import ingredientController from '../controllers/ingredientController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', protect, authorizeRoles('admin', 'nhan-vien-kho','nhan-vien-ban-hang') ,ingredientController.getAll);
router.get('/:id', protect, authorizeRoles('admin', 'nhan-vien-kho', 'nhan-vien-ban-hang'),  ingredientController.getById);

// Admin-only routes
router.post('/', protect, authorizeRoles('admin'), ingredientController.create);
router.put('/:id', protect, authorizeRoles('admin'),  ingredientController.update);
router.patch('/:id/deactivate',protect, authorizeRoles('admin'), ingredientController.deactivate);

export default router;
