import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { IOrder } from '../models/orderModel';
import { BadRequestError } from '../utils/errors';

export interface AuthRequest extends Request {
  user: { vaiTro: string };  // Tạo một kiểu riêng cho req.user
}

class OrderController {
  // Tạo đơn hàng mới
  async create(req: Request, res: Response) {
    try {
      const data: IOrder = req.body;
      const order = await orderService.create(data);
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy tất cả đơn hàng
  async getAll(req: Request, res: Response) {
    try {
      const orders = await orderService.getAll();
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy đơn hàng theo ID
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const order = await orderService.getById(id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const statusUpdate: Partial<IOrder['trangThai']> = req.body;
      const updatedOrder = await orderService.updateStatus(id, statusUpdate);
      res.status(200).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa đơn hàng
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await orderService.delete(id);
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
}

export default new OrderController();
