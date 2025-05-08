import express from 'express';
import orderDetailController from '../controllers/orderDetailController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Chỉ admin có thể tạo, cập nhật, xóa chi tiết đơn hàng
router.post('/', protect, adminOnly, orderDetailController.create); 
router.put('/:id', protect, adminOnly, orderDetailController.update);
router.delete('/:id', protect, adminOnly, orderDetailController.delete);

// Người dùng đã xác thực có thể xem
router.get('/', protect, orderDetailController.getAll);
router.get('/order/:maHoaDon', protect, orderDetailController.getByOrderId);

export default router;
