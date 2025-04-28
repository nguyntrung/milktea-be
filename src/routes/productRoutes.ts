import express from 'express';
import productController from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, productController.create);
router.put('/:id', protect, adminOnly, productController.update);
router.delete('/:id', protect, adminOnly, productController.delete);

// Routes accessible to all authenticated users
router.get('/', protect, productController.getAll);
router.get('/:id', protect, productController.getById);

export default router;
