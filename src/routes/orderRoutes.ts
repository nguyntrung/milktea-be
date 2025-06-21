import express from 'express';
import orderController from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes với quyền truy cập admin chỉ cho create, update, delete
router.post('/', protect, orderController.create);
router.put('/:id/status', protect, orderController.updateStatus);
router.patch('/:id/deactivate', protect, adminOnly, orderController.deactivate);
router.get('/auth/:userId', protect, orderController.getByCustomerId);
router.get('/filter', protect, orderController.filterOrdersByDate);

// Routes có thể truy cập cho tất cả người dùng đã xác thực
router.get('/', protect, orderController.getAll);
router.get('/top-seller', protect, orderController.getSellerProduct);
router.get('/paginated', protect, orderController.getPaginated);
router.get('/auth/:userId/paginated', protect, orderController.getPaginatedByCustomer);
router.get('/:id', protect, orderController.getById);

export default router;
