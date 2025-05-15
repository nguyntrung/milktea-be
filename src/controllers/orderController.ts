import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { IOrder, OrderInput } from '../models/orderModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiDonHang } from '../types/common';

class OrderController {
  // Tạo đơn hàng mới
  async create(req: Request, res: Response) {
    try {
      const data: OrderInput = req.body;
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

    // Lấy danh sách đơn hàng theo mã khách hàng
  async getByCustomerId(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      if (!userId) {
        throw new BadRequestError('Thiếu mã khách hàng');
      }

      const orders = await orderService.getByCustomerId(userId);

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

  // Cập nhật trạng thái đơn hàng
  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { trangThaiDonHang } = req.body;

      if (!TrangThaiDonHang) {
        throw new BadRequestError('Trạng thái đơn hàng không hợp lệ');
      }

      const updatedOrder = await orderService.updateStatus(
        id,
        trangThaiDonHang as TrangThaiDonHang
      );

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

  async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await orderService.deactivate(id);
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
