import { Request, Response } from 'express';
import feedbackService from '../services/feedbackService';
import { TrangThaiPhanHoi } from '../types/common';

class FeedbackController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const feedback = await feedbackService.createFeedback(data);
      res.status(201).json({ success: true, message: 'Gửi phản hồi thành công', data: feedback });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const data = await feedbackService.getAllFeedbacks();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = await feedbackService.getFeedbackById(id);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { trangThai, nguoiXuLy } = req.body;
      const updated = await feedbackService.updateStatus(id, trangThai, nguoiXuLy);
      res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await feedbackService.deleteFeedback(id);
      res.status(200).json({ success: true, message: 'Xoá phản hồi thành công', data: deleted });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

export default new FeedbackController();
