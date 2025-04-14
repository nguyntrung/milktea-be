import { Router } from 'express';
import {
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Lấy danh sách tất cả người dùng (chỉ admin)
router.get('/', authenticateToken, getAllUsers);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateToken, getCurrentUser);

// Lấy thông tin người dùng theo ID (chỉ admin hoặc chính người dùng đó)
router.get('/:id', authenticateToken, getUserById);

// Cập nhật thông tin người dùng (chỉ admin hoặc chính người dùng đó)
router.put('/:id', authenticateToken, updateUser);

// Xóa người dùng (chỉ admin hoặc chính người dùng đó)
router.delete('/:id', authenticateToken, deleteUser);

export default router;
