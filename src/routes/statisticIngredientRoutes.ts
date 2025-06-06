import express from 'express';
import statisticIngredientController from '../controllers/statisticIngredientController';
import { protect,adminOnly } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/statistic', protect, adminOnly, statisticIngredientController.getDynamicDailyStatistic);
router.get('/month', protect, adminOnly, statisticIngredientController.getMonthlyStatistics);
router.get('/daily', protect, adminOnly, statisticIngredientController.getDailyStatistics);
router.get('/year', protect, adminOnly, statisticIngredientController.getYearlyStatistics);
router.get('/revenue/month', protect, adminOnly, statisticIngredientController.getMonthlyRevenue);
router.get('/revenue/daily', protect, adminOnly, statisticIngredientController.getDailyRevenue);
router.get('/revenue/year', protect, adminOnly, statisticIngredientController.getYearlyRevenue);
router.get('/', protect, adminOnly, statisticIngredientController.getAll);
router.get('/:id', protect, adminOnly, statisticIngredientController.getById);
router.post('/haohut', protect, adminOnly, statisticIngredientController.updateHaoHut);

export default router;
