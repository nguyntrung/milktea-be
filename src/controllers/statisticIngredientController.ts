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

  //Thống kê nguyên liệu theo Tháng
  async getMonthlyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Tháng và năm không hợp lệ',
        });
        return;
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

  //Thống kê nguyên liệu theo Ngày
  async getDailyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const day = parseInt(req.query.day as string);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Thiếu hoặc sai định dạng month hoặc year',
        });
        return;
      }

      const data = await statisticIngredientService.getStatisticByDay(day,month, year);

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
      });
    }
  }

  async getYearlyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);

      if (isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Năm không hợp lệ',
        });
        return;
      }

      const data = await statisticIngredientService.getStatisticByYear(year);

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

  //Thống kê doanh thu theo Tháng
  async getMonthlyRevenue(req: Request, res: Response) {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Tháng hoặc năm không hợp lệ',
        });
        return;
      }

      const data = await statisticIngredientService.getRevenueByMonth(month, year);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
      });
    }
  }

  //Thống kê doanh thu theo Ngày
  async getDailyRevenue(req: Request, res: Response) {
    try {
      const day = parseInt(req.query.day as string);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Ngày / tháng / năm không hợp lệ',
        });
        return;
      }

      const data = await statisticIngredientService.getRevenueByDay(day, month, year);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
      });
    }
  }

  //Thống kê doanh thu theo Năm
  async getYearlyRevenue(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);

      if (isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Tháng và năm không hợp lệ',
        });
        return;
      }

      const data = await statisticIngredientService.getRevenueByYear(year);

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
}

export default new StatisticIngredientController();
