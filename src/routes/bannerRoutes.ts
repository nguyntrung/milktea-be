import express from 'express';
import bannerController from '../controllers/bannerController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', bannerController.getAll);
router.get('/filter', bannerController.getByPositionAndStatus);
router.get('/:id', bannerController.getById);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('hinhAnh'), bannerController.create);
router.put('/:id', protect, adminOnly, upload.single('hinhAnh'), bannerController.update);
router.delete('/:id', protect, adminOnly, bannerController.delete);

export default router;
