import { Request, Response } from 'express';
import reviewService from '../services/reviewService';

class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const review = await reviewService.create(data);
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getByCustomer(req: Request, res: Response) {
    try {
      const maKhachHang = req.params.id;
      const data = await reviewService.getByCustomer(maKhachHang);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

    async getAll(req: Request, res: Response) {
      try {
        const id = req.params.id;
        const result = await reviewService.getAll();
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

  async getByOrder(req: Request, res: Response) {
    try {
      const maDonHang = req.params.id;
      const data = await reviewService.getByOrder(maDonHang);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await reviewService.deactivate(id);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

export default new ReviewController();
