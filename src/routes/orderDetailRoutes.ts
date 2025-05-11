import express from 'express';
import orderDetailController from '../controllers/orderDetailController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OrderDetails
 *   description: Các API liên quan đến chi tiết đơn hàng
 */

/**
 * @swagger
 * /api/order-details:
 *   post:
 *     summary: Tạo chi tiết đơn hàng mới (Chỉ dành cho admin)
 *     tags: [OrderDetails]
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
 *               - productId
 *               - quantity
 *             properties:
 *               orderId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Chi tiết đơn hàng đã được tạo thành công
 *       401:
 *         description: Không có quyền truy cập
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', protect, adminOnly, orderDetailController.create);

/**
 * @swagger
 * /api/order-details/{id}:
 *   put:
 *     summary: Cập nhật chi tiết đơn hàng (Chỉ dành cho admin)
 *     tags: [OrderDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của chi tiết đơn hàng cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - productId
 *               - quantity
 *             properties:
 *               orderId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật chi tiết đơn hàng thành công
 *       404:
 *         description: Chi tiết đơn hàng không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/:id', protect, adminOnly, orderDetailController.update);

/**
 * @swagger
 * /api/order-details/{id}:
 *   delete:
 *     summary: Xóa chi tiết đơn hàng (Chỉ dành cho admin)
 *     tags: [OrderDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của chi tiết đơn hàng cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa chi tiết đơn hàng thành công
 *       404:
 *         description: Chi tiết đơn hàng không tìm thấy
 *       401:
 *         description: Không có quyền truy cập
 */
router.delete('/:id', protect, adminOnly, orderDetailController.delete);

/**
 * @swagger
 * /api/order-details:
 *   get:
 *     summary: Lấy danh sách tất cả chi tiết đơn hàng (Chỉ dành cho người dùng đã xác thực)
 *     tags: [OrderDetails]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách chi tiết đơn hàng
 */
router.get('/', protect, orderDetailController.getAll);

/**
 * @swagger
 * /api/order-details/order/{maHoaDon}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo mã hóa đơn
 *     tags: [OrderDetails]
 *     parameters:
 *       - name: maHoaDon
 *         in: path
 *         required: true
 *         description: Mã hóa đơn của đơn hàng cần lấy chi tiết
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công, trả về chi tiết đơn hàng
 *       404:
 *         description: Không tìm thấy chi tiết cho mã hóa đơn
 */
router.get('/order/:maHoaDon', protect, orderDetailController.getByOrderId);

export default router;
