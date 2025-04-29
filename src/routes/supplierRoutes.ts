import express from 'express';
import supplierController from '../controllers/supplierController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, supplierController.create);
router.put('/:id', protect, adminOnly, supplierController.update);
router.delete('/:id', protect, adminOnly, supplierController.delete);

// Routes accessible to all authenticated users
router.get('/', supplierController.getAll);
router.get('/:id', protect, supplierController.getById);

export default router;
