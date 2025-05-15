import { Request, Response } from 'express';
import promotionService from '../services/promotionService';
import { PromotionInput } from '../models/promotionModel';

class PromotionController {
  // Tạo khuyến mãi
  async create(req: Request, res: Response) {
    try {
      const data: PromotionInput = req.body;
      const promotion = await promotionService.create(data);
      res.status(201).json({
        success: true,
        data: promotion,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy tất cả khuyến mãi
  async getAll(req: Request, res: Response) {
    try {
      const result = await promotionService.getAll();
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

  // Lấy khuyến mãi theo ID
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const promotion = await promotionService.getById(id);
      res.status(200).json({
        success: true,
        data: promotion,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật khuyến mãi
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateData: Partial<PromotionInput> = req.body;
      const updated = await promotionService.update(id, updateData);
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

  // Xóa khuyến mãi
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await promotionService.delete(id);
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

export default new PromotionController();
