import express from 'express';
import promotionController from '../controllers/promotionController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Chỉ admin mới được tạo, cập nhật, xóa khuyến mãi
router.post('/', protect, adminOnly, promotionController.create);
router.put('/:id', protect, adminOnly, promotionController.update);
router.delete('/:id', protect, adminOnly, promotionController.delete);

// Người dùng đã xác thực có thể xem danh sách và chi tiết khuyến mãi
router.get('/', protect, promotionController.getAll);
router.get('/:id', protect, promotionController.getById);

export default router;
