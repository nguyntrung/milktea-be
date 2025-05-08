import express from 'express';
import orderController from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes với quyền truy cập admin chỉ cho create, update, delete
router.post('/', protect, orderController.create); // Tạo đơn hàng mới
router.put('/:id/status', protect, adminOnly, orderController.updateStatus); // Cập nhật trạng thái đơn hàng (người dùng hoặc admin)
router.patch('/:id/deactivate', protect, adminOnly, orderController.deactivate);

// Routes có thể truy cập cho tất cả người dùng đã xác thực
router.get('/', protect, orderController.getAll); // Lấy tất cả đơn hàng
router.get('/:id', protect, orderController.getById); // Lấy đơn hàng theo ID

export default router;
