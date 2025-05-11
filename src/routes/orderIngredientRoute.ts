import express from 'express';
import orderIngredientController from '../controllers/orderIngredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OrderIngredients
 *   description: Các API liên quan đến nguyên liệu trong đơn hàng
 */

/**
 * @swagger
 * /api/order-ingredients:
 *   post:
 *     summary: Tạo nguyên liệu trong đơn hàng (Chỉ dành cho admin)
 *     tags: [OrderIngredients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - ingredientId
 *               - quantity
 *             properties:
 *               orderId:
 *                 type: string
 *               ingredientId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Nguyên liệu trong đơn hàng đã được tạo thành công
 *       401:
 *         description: Không có quyền truy cập
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', protect, adminOnly, orderIngredientController.create);

/**
 * @swagger
 * /api/order-ingredients/{id}:
 *   delete:
 *     summary: Xóa nguyên liệu trong đơn hàng (Chỉ dành cho admin)
 *     tags: [OrderIngredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu trong đơn hàng cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa nguyên liệu trong đơn hàng thành công
 *       404:
 *         description: Nguyên liệu trong đơn hàng không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete('/:id', protect, adminOnly, orderIngredientController.delete);

/**
 * @swagger
 * /api/order-ingredients:
 *   get:
 *     summary: Lấy danh sách tất cả nguyên liệu trong các đơn hàng (Chỉ dành cho người dùng đã xác thực)
 *     tags: [OrderIngredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách nguyên liệu trong đơn hàng
 */
router.get('/', protect, orderIngredientController.getAll);

/**
 * @swagger
 * /api/order-ingredients/{id}:
 *   get:
 *     summary: Lấy thông tin nguyên liệu trong đơn hàng theo ID
 *     tags: [OrderIngredients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu trong đơn hàng cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin nguyên liệu trong đơn hàng
 *       404:
 *         description: Nguyên liệu trong đơn hàng không tìm thấy
 */
router.get('/:id', protect, orderIngredientController.getById);

export default router;
