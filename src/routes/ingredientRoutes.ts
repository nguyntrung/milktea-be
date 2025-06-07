import express from 'express';
import ingredientController from '../controllers/ingredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', ingredientController.getAll);
router.get('/:id', ingredientController.getById);

// Admin-only routes
router.post('/', adminOnly, ingredientController.create);
router.put('/:id', adminOnly, ingredientController.update);
router.patch('/:id/deactivate', protect, adminOnly, ingredientController.deactivate);

export default router;
