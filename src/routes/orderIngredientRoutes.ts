import express from 'express';
import orderIngredientController from '../controllers/orderIngredientController';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, authorizeRoles('admin', 'nhan-vien-kho'), orderIngredientController.create);
router.put('/:id', protect, authorizeRoles('admin', 'nhan-vien-kho'), orderIngredientController.update);
router.delete('/:id', protect, adminOnly, orderIngredientController.delete);

// Routes accessible to all authenticated users
router.get('/', protect, orderIngredientController.getAll);
router.get('/:id', protect, orderIngredientController.getById);

export default router;
