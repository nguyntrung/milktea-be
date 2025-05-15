import express from 'express';
import orderIngredientDetailController from '../controllers/orderIngredientDetailController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, orderIngredientDetailController.getAll);
router.get('/:id', protect, orderIngredientDetailController.getById);
router.post('/', protect, orderIngredientDetailController.create);
router.put('/:id', protect, orderIngredientDetailController.update);
router.delete('/:id', protect, orderIngredientDetailController.delete);

export default router;
