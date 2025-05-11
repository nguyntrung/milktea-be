import express from 'express';
import supplierController from '../controllers/supplierController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Các API liên quan đến nhà cung cấp
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Lấy danh sách tất cả nhà cung cấp (Dành cho người dùng đã xác thực)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách nhà cung cấp
 */
router.get('/', protect, supplierController.getAll);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Lấy thông tin nhà cung cấp theo ID (Dành cho người dùng đã xác thực)
 *     tags: [Suppliers]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nhà cung cấp cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin nhà cung cấp
 *       404:
 *         description: Nhà cung cấp không tìm thấy
 */
router.get('/:id', protect, supplierController.getById);

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Tạo nhà cung cấp mới (Chỉ dành cho admin)
 *     tags: [Suppliers]
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
 *               - contactInfo
 *             properties:
 *               name:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nhà cung cấp đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', protect, adminOnly, supplierController.create);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhà cung cấp (Chỉ dành cho admin)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nhà cung cấp cần cập nhật
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
 *               - contactInfo
 *             properties:
 *               name:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật nhà cung cấp thành công
 *       404:
 *         description: Nhà cung cấp không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, supplierController.update);

/**
 * @swagger
 * /api/suppliers/{id}/deactivate:
 *   patch:
 *     summary: Tạm ngưng nhà cung cấp (Chỉ dành cho admin)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của nhà cung cấp cần tạm ngưng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nhà cung cấp đã được tạm ngưng
 *       404:
 *         description: Nhà cung cấp không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch('/:id/deactivate', protect, adminOnly, supplierController.deactivate);

export default router;
