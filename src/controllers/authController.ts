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
            ngaySinh: user.ngaySinh,
            gioiTinh: user.gioiTinh,
            soDienThoai: user.soDienThoai,
            diemTichLuy: user.diemTichLuy,
            lichSuDiem: user.lichSuDiem,
            diaChi: user.diaChi,
            khuyenMaiDaSuDung: user.khuyenMaiDaSuDung,
            vaiTro: user.vaiTro,
            hoatDong: user.hoatDong,
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
            ngaySinh: user.ngaySinh,
            gioiTinh: user.gioiTinh,
            soDienThoai: user.soDienThoai,
            diemTichLuy: user.diemTichLuy,
            lichSuDiem: user.lichSuDiem,
            diaChi: user.diaChi,
            khuyenMaiDaSuDung: user.khuyenMaiDaSuDung,
            vaiTro: user.vaiTro,
            hoatDong: user.hoatDong,
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

  async getAll(req: Request, res: Response) {
    try {
      const users = await authService.getAll();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const user = await authService.getByAscendancyById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data: Partial<RegisterInput> & { diaChi?: string } = req.body;
      const user = await authService.update(id, data);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await authService.deactivate(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addPoints(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { diem, noiDung } = req.body;
      const user = await authService.addPoints(id, diem, noiDung);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addUsedPromotion(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { maKhuyenMai } = req.body;
      const user = await authService.addUsedPromotion(id, maKhuyenMai);
      res.status(200).json({
        success: true,
        data: user,
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
