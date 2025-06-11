import express from 'express';
import reviewController from '../controllers/reviewController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, reviewController.create);
router.get('/', protect, authorizeRoles('admin'), reviewController.getAll);
router.get('/order/:id', protect, authorizeRoles('admin'), reviewController.getByOrder);
router.get('/customer/:id', protect, authorizeRoles('admin'), reviewController.getByCustomer);
router.patch('/:id/deactivate', protect, authorizeRoles('admin'), reviewController.deactivate);

export default router;
