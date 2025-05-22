import express from 'express';
import authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/:id', protect, authController.getById);

// Example protected route
router.get('/profile', protect, (req: any, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
