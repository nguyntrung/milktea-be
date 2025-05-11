import express from 'express';
import ingredientController from '../controllers/ingredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Các API liên quan đến nguyên liệu
 */

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: Lấy danh sách tất cả nguyên liệu
 *     tags: [Ingredients]
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách nguyên liệu
 */
router.get('/', ingredientController.getAll);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     summary: Lấy thông tin nguyên liệu theo ID
 *     tags: [Ingredients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin nguyên liệu
 *       404:
 *         description: Nguyên liệu không tìm thấy
 */
router.get('/:id', ingredientController.getById);

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     summary: Tạo nguyên liệu mới (Chỉ dành cho admin)
 *     tags: [Ingredients]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nguyên liệu đã được tạo thành công
 *       401:
 *         description: Không có quyền truy cập
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', protect, adminOnly, ingredientController.create);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     summary: Cập nhật thông tin nguyên liệu (Chỉ dành cho admin)
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu cần cập nhật
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Nguyên liệu không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, ingredientController.update);

/**
 * @swagger
 * /api/ingredients/{id}/deactivate:
 *   patch:
 *     summary: Tạm ngưng nguyên liệu (Chỉ dành cho admin)
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nguyên liệu cần tạm ngưng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nguyên liệu đã được tạm ngưng
 *       404:
 *         description: Nguyên liệu không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch('/:id/deactivate', protect, adminOnly, ingredientController.deactivate);

export default router;
