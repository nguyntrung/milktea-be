import express from 'express';
import ingredientController from '../controllers/ingredientController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Routes with admin-only access for create, update, delete
router.post('/', protect, adminOnly, ingredientController.create);
router.put('/:id', protect, adminOnly, ingredientController.update);
router.delete('/:id', protect, adminOnly, ingredientController.delete);

// Routes accessible to all authenticated users
router.get('/', ingredientController.getAll);
router.get('/:id', protect, ingredientController.getById);

export default router;
