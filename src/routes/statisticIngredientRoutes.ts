import express from 'express';
import statisticIngredientController from '../controllers/statisticIngredientController';
import { adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Lấy toàn bộ thống kê nguyên liệu chỉ được với Admin (có thể lọc sau này qua query)
router.get('/', adminOnly, statisticIngredientController.getAll);

// Lấy thống kê nguyên liệu theo ID
router.get('/:id', adminOnly, statisticIngredientController.getById);

export default router;
