import express from 'express';
import orderIngredientDetailController from '../controllers/orderIngredientDetailController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, orderIngredientDetailController.getAll);
router.get('/:id', protect, orderIngredientDetailController.getById);
router.post('/', protect, authorizeRoles('admin', 'nhan-vien-kho'), orderIngredientDetailController.create);
router.put('/:id', protect, authorizeRoles('admin', 'nhan-vien-kho'), orderIngredientDetailController.update);
router.delete('/:id', protect, orderIngredientDetailController.delete);

export default router;
