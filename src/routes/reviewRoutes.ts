import express from 'express';
import reviewController from '../controllers/reviewController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, reviewController.create);
router.get('/', protect, reviewController.getAll);
router.get('/', reviewController.getAll);
router.get('/order/:id', reviewController.getByOrder);
router.get('/customer/:id', reviewController.getByCustomer);
router.patch('/:id/deactivate',protect, authorizeRoles('admin'), reviewController.deactivate);

export default router;
