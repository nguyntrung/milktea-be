import express from 'express';
import reviewController from '../controllers/reviewController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', reviewController.create);
router.get('/', reviewController.getAll);
router.get('/order/:id', reviewController.getByOrder);
router.get('/customer/:id', reviewController.getByCustomer);
router.patch('/:id/deactivate',  reviewController.deactivate);

export default router;
