import express from 'express';
import categoryController from '../controllers/categoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Các API liên quan đến danh mục
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách danh mục
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy thông tin danh mục theo ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin danh mục
 *       404:
 *         description: Danh mục không tìm thấy
 */
router.get('/:id', categoryController.getById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới (Chỉ dành cho admin)
 *     tags: [Categories]
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
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo thành công
 *       401:
 *         description: Không có quyền truy cập
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', protect, adminOnly, categoryController.create);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin danh mục (Chỉ dành cho admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục cần cập nhật
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
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Danh mục không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, categoryController.update);

/**
 * @swagger
 * /api/categories/{id}/deactivate:
 *   patch:
 *     summary: Tạm ngưng danh mục (Chỉ dành cho admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục cần tạm ngưng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh mục đã được tạm ngưng
 *       404:
 *         description: Danh mục không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch('/:id/deactivate', protect, adminOnly, categoryController.deactivate);

export default router;
