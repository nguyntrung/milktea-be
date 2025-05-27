import feedbackModel, { FeedbackInput } from '../models/feedbackModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiPhanHoi } from '../types/common';

class FeedbackService {
  async createFeedback(data: FeedbackInput ) {
    return await feedbackModel.create({
      ...data,
      trangThai: TrangThaiPhanHoi.DANG_XU_LY
    });
  }

  async getAllFeedbacks() {
    return await feedbackModel.find().sort({ ngayTao: -1 });
  }

  async getFeedbackById(id: string) {
    const feedback = await feedbackModel.findById(id);
    if (!feedback) throw new BadRequestError('Không tìm thấy phản hồi');
    return feedback;
  }

  async updateStatus(id: string, trangThai: TrangThaiPhanHoi, nguoiXuLy?: string) {
    const feedback = await feedbackModel.findById(id);
    if (!feedback) throw new BadRequestError('Không tìm thấy phản hồi');

    feedback.trangThai = trangThai;
    feedback.ngayXuLy = new Date();
    feedback.nguoiXuLy = nguoiXuLy || '';
    feedback.ngayCapNhat = new Date();
    await feedback.save();

    return feedback;
  }

  async deleteFeedback(id: string) {
    const deleted = await feedbackModel.findByIdAndDelete(id);
    if (!deleted) throw new BadRequestError('Không tìm thấy phản hồi để xoá');
    return deleted;
  }
}

export default new FeedbackService();
