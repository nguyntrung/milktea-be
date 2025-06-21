import express from 'express';
import userVerifyController from '../controllers/userVerifyController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/auth/request-otp', userVerifyController.requestOtp);
router.post('/auth/verify-otp', userVerifyController.verifyOtp);
router.delete('/auth/delete-otp', protect,  authorizeRoles('admin'), userVerifyController.deleteOtp);
router.get('/auth/otp/:email', protect,  authorizeRoles('admin'), userVerifyController.getByEmail);

export default router;
