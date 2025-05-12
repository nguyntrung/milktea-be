import express from 'express';
import cartController from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Tất cả các routes đều được bảo vệ bởi middleware xác thực
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:itemIndex', cartController.updateCartItem);
router.delete('/items/:itemIndex', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
