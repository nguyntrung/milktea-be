import express from 'express';
import reviewController from '../controllers/reviewController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, adminOnly, reviewController.create);
router.get('/product/:id', adminOnly, reviewController.getByProduct);
router.get('/customer/:id', adminOnly, reviewController.getByCustomer);
router.patch('/:id/deactivate', adminOnly, reviewController.deactivate);

export default router;
