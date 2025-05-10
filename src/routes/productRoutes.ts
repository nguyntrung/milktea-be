import express from 'express';
import productController from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

// Routes accessible to all authenticated users
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

export default router;
