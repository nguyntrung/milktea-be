import express from 'express';
import orderController from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Các API liên quan đến đơn hàng
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', protect, orderController.create);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Chỉ dành cho admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần cập nhật trạng thái
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái đơn hàng thành công
 *       404:
 *         description: Đơn hàng không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id/status', protect, adminOnly, orderController.updateStatus);

/**
 * @swagger
 * /api/orders/{id}/deactivate:
 *   patch:
 *     summary: Tạm ngưng đơn hàng (Chỉ dành cho admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần tạm ngưng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được tạm ngưng
 *       404:
 *         description: Đơn hàng không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.patch('/:id/deactivate', protect, adminOnly, orderController.deactivate);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy tất cả đơn hàng (Chỉ dành cho người dùng đã xác thực)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách đơn hàng
 */
router.get('/', protect, orderController.getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy thông tin đơn hàng theo ID
 *     tags: [Orders]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần lấy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin đơn hàng
 *       404:
 *         description: Đơn hàng không tìm thấy
 */
router.get('/:id', protect, orderController.getById);

export default router;
