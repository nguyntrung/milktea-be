import express from 'express';
import statisticIngredientController from '../controllers/statisticIngredientController';
import { adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: StatisticIngredients
 *   description: Các API liên quan đến thống kê nguyên liệu
 */

/**
 * @swagger
 * /api/statistic-ingredients:
 *   get:
 *     summary: Lấy toàn bộ thống kê nguyên liệu (Chỉ dành cho admin)
 *     tags: [StatisticIngredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách thống kê nguyên liệu
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', adminOnly, statisticIngredientController.getAll);

/**
 * @swagger
 * /api/statistic-ingredients/{id}:
 *   get:
 *     summary: Lấy thống kê nguyên liệu theo ID (Chỉ dành cho admin)
 *     tags: [StatisticIngredients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu cần lấy thống kê
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin thống kê nguyên liệu
 *       404:
 *         description: Nguyên liệu không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/:id', adminOnly, statisticIngredientController.getById);

export default router;
