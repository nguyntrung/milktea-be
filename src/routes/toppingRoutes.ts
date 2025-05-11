import express from 'express';
import toppingController from '../controllers/toppingController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Toppings
 *   description: Các API liên quan đến topping
 */

/**
 * @swagger
 * /api/toppings:
 *   get:
 *     summary: Lấy danh sách tất cả topping (Dành cho người dùng đã xác thực)
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách topping
 */
router.get('/', protect, toppingController.getAll);

/**
 * @swagger
 * /api/toppings/{id}:
 *   get:
 *     summary: Lấy thông tin topping theo ID (Dành cho người dùng đã xác thực)
 *     tags: [Toppings]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của topping cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin topping
 *       404:
 *         description: Topping không tìm thấy
 */
router.get('/:id', protect, toppingController.getById);

/**
 * @swagger
 * /api/toppings:
 *   post:
 *     summary: Tạo topping mới (Chỉ dành cho admin)
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Topping đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', protect, adminOnly, toppingController.create);

/**
 * @swagger
 * /api/toppings/{id}:
 *   put:
 *     summary: Cập nhật thông tin topping (Chỉ dành cho admin)
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của topping cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật topping thành công
 *       404:
 *         description: Topping không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, toppingController.update);

/**
 * @swagger
 * /api/toppings/{id}/deactivate:
 *   patch:
 *     summary: Tạm ngưng topping (Chỉ dành cho admin)
 *     tags: [Toppings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của topping cần tạm ngưng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topping đã được tạm ngưng
 *       404:
 *         description: Topping không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch('/:id/deactivate', protect, adminOnly, toppingController.deactivate);

export default router;
