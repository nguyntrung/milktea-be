import express from 'express';
import storeController from '../controllers/storeController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import multer from 'multer';

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Public route
router.get('/', storeController.getStoreInfo);

// Admin-only route
router.put('/', protect, adminOnly, upload.single('logo'), storeController.updateStoreInfo);

export default router;
