import { Request, Response } from 'express';
import statisticIngredientService from '../services/statisticIngredientService';

class StatisticIngredientController {
  // Thống kê động theo ngày từ dữ liệu thực tế (không phụ thuộc vào collection thống kê)
  async getDynamicDailyStatistic(req: Request, res: Response): Promise<void> {
    try {
      const day = parseInt(req.query.day as string);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Thiếu hoặc sai định dạng ngày / tháng / năm',
        });
        return;
      }

      const date = new Date(Date.UTC(year, month - 1, day));
      const data = await statisticIngredientService.getDailyIngredientStatistic(date);

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

  async updateHaoHut(req: Request, res: Response): Promise<void> {
    try {
      const day = parseInt(req.query.day as string);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);
      const list = req.body;

      if (isNaN(day) || isNaN(month) || isNaN(year) || !Array.isArray(list)) {
        res.status(400).json({
          success: false,
          message: 'Ngày / tháng / năm hoặc dữ liệu đầu vào không hợp lệ',
        });
        return;
      }

      const date = new Date(Date.UTC(year, month - 1, day));
      const result = await statisticIngredientService.updateHaoHut(date, list);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ',
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

  //Thống kê doanh thu theo Tháng
  async getDayInMonthlyRevenue(req: Request, res: Response) {
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

      const data = await statisticIngredientService.getRevenueByDaysInMonth(month, year);

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

  //Thống kê doanh thu theo Năm
  async getMonthInYearlyRevenue(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);

      if (isNaN(year)) {
        res.status(400).json({
          success: false,
          message: 'Tháng và năm không hợp lệ',
        });
        return;
      }

      const data = await statisticIngredientService.getRevenueByMonthsInYear(year);

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
