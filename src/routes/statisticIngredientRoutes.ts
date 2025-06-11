import express from 'express';
import statisticIngredientController from '../controllers/statisticIngredientController';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/statistic', protect, authorizeRoles('admin', 'nhan-vien-kho'), statisticIngredientController.getDynamicDailyStatistic);
router.get('/month', protect, authorizeRoles('admin'), statisticIngredientController.getMonthlyStatistics);
router.get('/daily', protect, authorizeRoles('admin'), statisticIngredientController.getDailyStatistics);
router.get('/year', protect, authorizeRoles('admin'), statisticIngredientController.getYearlyStatistics);
router.get('/revenue/month', protect, authorizeRoles('admin'), statisticIngredientController.getMonthlyRevenue);
router.get('/revenue/daily', protect, authorizeRoles('admin'), statisticIngredientController.getDailyRevenue);
router.get('/revenue/year', protect, authorizeRoles('admin'), statisticIngredientController.getYearlyRevenue);
router.get('/', protect, authorizeRoles('admin', 'nhan-vien-kho'), statisticIngredientController.getAll);
router.get('/:id', protect, authorizeRoles('admin', 'nhan-vien-kho'), statisticIngredientController.getById);
router.post('/haohut', protect, authorizeRoles('admin', 'nhan-vien-kho'), statisticIngredientController.updateHaoHut);

export default router;
