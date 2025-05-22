import express from 'express';
import statisticIngredientController from '../controllers/statisticIngredientController';
import { protect,adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/month', protect, adminOnly, statisticIngredientController.getMonthlyStatistics);
router.get('/daily', protect, adminOnly, statisticIngredientController.getDailyStatistics);
router.get('/', protect, adminOnly, statisticIngredientController.getAll);
router.get('/:id', protect, adminOnly, statisticIngredientController.getById);
router.post('/', protect, adminOnly, statisticIngredientController.create);
router.put('/', protect, adminOnly, statisticIngredientController.update);

export default router;
