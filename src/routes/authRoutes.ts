import express from 'express';
import authController from '../controllers/authController';
import { adminOnly, protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', authController.resetPassword);
router.put('/:id', protect, authController.update);
router.get('/:id', protect, authController.getById);
router.get("/", authController.getAll)

// Example protected route
router.get('/profile', protect, (req: any, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
