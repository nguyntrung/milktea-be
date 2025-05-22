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

  async getMonthlyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Tháng và năm không hợp lệ',
        });
        return; // Dừng hàm lại sau khi response
      }

      const data = await statisticIngredientService.getStatisticByMonth(month, year);

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

  async getDailyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Thiếu hoặc sai định dạng month hoặc year',
        });
        return;
      }

      const data = await statisticIngredientService.getStatisticByDay(month, year);

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
      });
    }
  }
}

export default new StatisticIngredientController();
