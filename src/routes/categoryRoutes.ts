import express from 'express';
import categoryController from '../controllers/categoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, categoryController.create);
router.put('/:id', protect, adminOnly, categoryController.update);
router.delete('/:id', protect, adminOnly, categoryController.delete);

// Routes accessible to all authenticated users
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

export default router;
