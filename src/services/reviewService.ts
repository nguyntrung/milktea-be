import reviewModel, { ReviewInput } from '../models/reviewModel';
import { BadRequestError } from '../utils/errors';

class ReviewService {
  async create(data: ReviewInput) {
    return await reviewModel.create({
      ...data,
      ngayDanhGia: new Date(),
      hoatDong: true
    });
  }

  async getByProduct(maSanPham: string) {
    return await reviewModel
      .find({ maSanPham, hoatDong: true })
      .sort({ ngayDanhGia: -1 });
  }

  async getByCustomer(maKhachHang: string) {
    return await reviewModel
      .find({ maKhachHang, hoatDong: true })
      .sort({ ngayDanhGia: -1 });
  }

  async deactivate(id: string) {
    const review = await reviewModel.findById(id);
    if (!review) throw new BadRequestError('Đánh giá không tồn tại');

    review.hoatDong = false;
    review.ngayCapNhat = new Date();
    await review.save();

    return { message: 'Đã ẩn đánh giá thành công', review };
  }
}

export default new ReviewService();
