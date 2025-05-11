import express from 'express';
import productController from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Các API liên quan đến sản phẩm
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới (Chỉ dành cho admin)
 *     tags: [Products]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', protect, adminOnly, productController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm (Chỉ dành cho admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của sản phẩm cần cập nhật
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
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
 *       404:
 *         description: Sản phẩm không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Chỉ dành cho admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của sản phẩm cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
 *       404:
 *         description: Sản phẩm không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete('/:id', protect, adminOnly, productController.delete);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm (Chỉ dành cho người dùng đã xác thực)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách sản phẩm
 */
router.get('/', protect, productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của sản phẩm cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin sản phẩm
 *       404:
 *         description: Sản phẩm không tìm thấy
 */
router.get('/:id', protect, productController.getById);

export default router;
