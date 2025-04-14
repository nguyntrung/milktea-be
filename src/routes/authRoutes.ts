import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Đăng ký người dùng mới
router.post('/register', register);

// Đăng nhập người dùng
router.post('/login', login);

export default router;