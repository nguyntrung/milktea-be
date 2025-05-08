import { Request, Response } from 'express';
import orderDetailService from '../services/orderDetailService';
import { IOrderDetail, OrderDetailInput } from '../models/orderDetailModel';

class OrderDetailController {
  // Tạo chi tiết đơn hàng
  async create(req: Request, res: Response) {
    try {
      const data: OrderDetailInput = req.body;
      const detail = await orderDetailService.create(data);
      res.status(201).json({
        success: true,
        data: detail,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy tất cả chi tiết đơn hàng
  async getAll(req: Request, res: Response) {
    try {
      const result = await orderDetailService.getAll();
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

  // Lấy chi tiết theo mã hóa đơn
  async getByOrderId(req: Request, res: Response) {
    try {
      const maHoaDon = req.params.maHoaDon;
      const details = await orderDetailService.getByOrderId(maHoaDon);
      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật chi tiết đơn hàng
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateData: Partial<IOrderDetail> = req.body;
      const updated = await orderDetailService.update(id, updateData);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa chi tiết đơn hàng
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await orderDetailService.delete(id);
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

export default new OrderDetailController();
