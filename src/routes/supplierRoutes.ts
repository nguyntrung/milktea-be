import express from 'express';
import supplierController from '../controllers/supplierController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);

// Admin-only routes
router.post('/', supplierController.create);
router.put('/:id', supplierController.update);
router.patch('/:id/deactivate', protect, adminOnly, supplierController.deactivate);

export default router;
