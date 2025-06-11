import express from 'express';
import reviewController from '../controllers/reviewController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, adminOnly, reviewController.create);
router.get('/order/:id', adminOnly, reviewController.getByOrder);
router.get('/customer/:id', adminOnly, reviewController.getByCustomer);
router.patch('/:id/deactivate', adminOnly, reviewController.deactivate);

export default router;
