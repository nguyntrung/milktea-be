import express from 'express';
import supplierController from '../controllers/supplierController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);

// Admin-only routes
router.post('/', protect, authorizeRoles('admin'), supplierController.create);
router.put('/:id', protect, authorizeRoles('admin'), supplierController.update);
router.patch('/:id/deactivate', protect, authorizeRoles('admin'), supplierController.deactivate);
router.delete('/:id', protect, authorizeRoles('admin'), supplierController.delete);

export default router;
