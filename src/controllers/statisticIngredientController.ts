import { Request, Response } from 'express';
import statisticIngredientService from '../services/statisticIngredientService';

class StatisticIngredientController {
  async create(req: Request, res: Response) {
    try {
      const input = req.body;

      const data = await statisticIngredientService.createStatistic(input);
      res.status(201).json({
        success: true,
        message: 'Tạo thống kê nguyên liệu thành công',
        data,
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
      const data = await statisticIngredientService.getAll();
      res.status(200).json({
        success: true,
        data,
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
      const data = await statisticIngredientService.getById(id);
      res.status(200).json({
        success: true,
        data,
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
      const input = req.body;

      const updated = await statisticIngredientService.updateStatistic(id, input);
      res.status(200).json({
        success: true,
        message: 'Cập nhật thống kê nguyên liệu thành công',
        data: updated,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StatisticIngredientController();
