import express from 'express';
import ingredientController from '../controllers/ingredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes với quyền admin cho tạo, cập nhật, xóa nguyên liệu
router.post('/', protect, adminOnly, ingredientController.create);
router.put('/:id', protect, adminOnly, ingredientController.update);
router.delete('/:id', protect, adminOnly, ingredientController.delete);

// Routes có thể truy cập cho tất cả người dùng đã đăng nhập
router.get('/', protect, ingredientController.getAll); // Bảo vệ cho tất cả người dùng đã đăng nhập
router.get('/:id', protect, ingredientController.getById); // Bảo vệ cho tất cả người dùng đã đăng nhập

export default router;
