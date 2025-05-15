import express from 'express';
import orderIngredientController from '../controllers/orderIngredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, orderIngredientController.create);
// router.put('/:id', protect, adminOnly, orderIngredientController.update);
router.delete('/:id', protect, adminOnly, orderIngredientController.delete);

// Routes accessible to all authenticated users
router.get('/', protect, orderIngredientController.getAll);
router.get('/:id', protect, orderIngredientController.getById);

export default router;
