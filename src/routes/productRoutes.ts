import express from 'express';
import productController from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join(__dirname, '../../Uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

// Routes with admin-only access
router.post(
  '/upload-image',
  protect,
  adminOnly,
  upload.array('images', 5),
  productController.uploadToCloudinary
);
router.post('/', protect, adminOnly, productController.create);
router.put('/:id', protect, adminOnly, productController.update);
router.delete('/:id', protect, adminOnly, productController.delete);
// router.post('/upload-image', protect, adminOnly, productController.uploadToCloudinary);

// Routes accessible to all authenticated users
router.get('/', productController.getAll);
router.get('/paginated', productController.getPaginated);
router.get('/:id', productController.getById);
router.get('/category/:maDanhMuc', productController.getByCategoryId);

export default router;
