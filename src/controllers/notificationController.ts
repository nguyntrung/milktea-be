import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import { NotificationInput } from '../models/notificationModel';

class NotificationController {
  // Tạo mới thông báo
  async create(req: Request, res: Response) {
    try {
      const data: NotificationInput = req.body;
      const notification = await notificationService.create(data);
      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy tất cả thông báo (có thể filter theo user nếu cần)
  async getAll(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getAll();
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy thông báo theo ID
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const notification = await notificationService.getById(id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await notificationService.markAsRead(id);
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

  // Lấy thông báo theo người nhận
  async getByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const notifications = await notificationService.getAllByUser(userId);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new NotificationController();
