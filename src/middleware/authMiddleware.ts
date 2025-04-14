import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: { userId: string; vai_tro: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Token không tồn tại' });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET không được cấu hình trong biến môi trường');
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      vai_tro: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token không hợp lệ', error: (error as Error).message });
  }
};
