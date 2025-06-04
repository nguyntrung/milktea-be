import express from 'express';
import categoryController from '../controllers/categoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('hinhAnh'), categoryController.create);
router.put('/:id', protect, adminOnly, upload.single('hinhAnh'), categoryController.update);
router.patch('/:id/deactivate', protect, adminOnly, categoryController.deactivate);

export default router;
