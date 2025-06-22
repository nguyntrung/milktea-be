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

  // Lấy danh sách đơn hàng với phân trang
  async getPaginated(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (isNaN(page) || page < 1) {
        throw new BadRequestError('Số trang không hợp lệ');
      }
      if (isNaN(limit) || limit < 1) {
        throw new BadRequestError('Giới hạn không hợp lệ');
      }

      const result = await orderService.getPaginated(page, limit);

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

  // Lấy danh sách đơn hàng theo user với phân trang
  async getPaginatedByCustomer(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!userId) {
        throw new BadRequestError('Thiếu mã khách hàng');
      }
      if (isNaN(page) || page < 1) {
        throw new BadRequestError('Số trang không hợp lệ');
      }
      if (isNaN(limit) || limit < 1) {
        throw new BadRequestError('Giới hạn không hợp lệ');
      }

      const result = await orderService.getPaginatedByCustomer(userId, page, limit);

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
  
  // Thống kê theo điều kiện
  async filterOrdersByDate(req: Request, res: Response) {
    try {
      const day = req.query.day ? parseInt(req.query.day as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      if (!year || isNaN(year)) {
        res.status(400).json({ success: false, message: 'Phải cung cấp năm hợp lệ để lọc' });
        return;
      }

      const data = await orderService.filterByDate({ ngay: day, thang: month, nam: year });

      res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
      });
    }
  }

  // Lấy tất cả đơn hàng
  async getSellerProduct(req: Request, res: Response) {
    try {
      const orders = await orderService.getTopSellingProducts();
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
}

export default new OrderController();
