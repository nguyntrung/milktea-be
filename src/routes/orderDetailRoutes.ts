import express from 'express';
import orderDetailController from '../controllers/orderDetailController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, orderDetailController.create); 
router.put('/:id', protect, orderDetailController.update);
router.delete('/:id', protect, orderDetailController.delete);

router.get('/', protect, adminOnly, orderDetailController.getAll);
router.get('/:maHoaDon', protect, orderDetailController.getByOrderId);

export default router;
