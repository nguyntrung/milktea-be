import express from 'express';
import toppingController from '../controllers/toppingController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, toppingController.create);
router.put('/:id', protect, adminOnly, toppingController.update);
router.delete('/:id', protect, adminOnly, toppingController.delete);

// Routes accessible to all authenticated users
router.get('/', toppingController.getAll);
router.get('/:id', protect, toppingController.getById);

export default router;
