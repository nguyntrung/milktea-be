import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import userModel from '../models/userModel';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

interface AuthRequest extends Request {
  user?: any;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Không có token, vui lòng đăng nhập');
    }

    const decoded = verifyToken(token);
    const user = await userModel.findById(decoded.userId).select('-matKhau');

    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại');
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message,
    });
  }
};

const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.vaiTro !== 'admin') {
      throw new ForbiddenError('Chỉ admin mới có quyền truy cập');
    }
    next();
  } catch (error: any) {
    res.status(error.statusCode || 403).json({
      success: false,
      message: error.message,
    });
  }
};

export { protect, adminOnly };
