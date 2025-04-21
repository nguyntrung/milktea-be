import { Request, Response } from 'express';
import authService from '../services/authService';
import { RegisterInput, LoginInput } from '../models/userModel';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterInput = req.body;
      const { user, token } = await authService.register(data);
      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            ten: user.ten,
            vaiTro: user.vaiTro,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginInput = req.body;
      const { user, token } = await authService.login(data);
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            ten: user.ten,
            vaiTro: user.vaiTro,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AuthController();
