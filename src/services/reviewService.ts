import reviewModel, { ReviewInput } from '../models/reviewModel';
import orderModel from '../models/orderModel';
import { BadRequestError } from '../utils/errors';

class ReviewService {
  async create(data: ReviewInput) {
    // Kiểm tra đơn hàng
    const order = await orderModel.findById(data.maDonHang);
    const maKhachHang = data.maKhachHang || order?.maKhachHang;
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');
    if (order.maKhachHang !== maKhachHang)
      throw new BadRequestError('Bạn không có quyền đánh giá đơn hàng này');

    // Kiểm tra đã từng đánh giá chưa
    const existed = await reviewModel.findOne({ maDonHang: data.maDonHang });
    if (existed) throw new BadRequestError('Đơn hàng này đã được đánh giá!');

    return await reviewModel.create({
      ...data,
      maKhachHang: order.maKhachHang,
      ngayDanhGia: new Date(),
      hoatDong: true
    });
  }

  async getByCustomer(maKhachHang: string) {
    return await reviewModel
      .find({ maKhachHang, hoatDong: true })
      .sort({ ngayDanhGia: -1 });
  }

  // Lấy đánh giá theo đơn hàng
  async getByOrder(maDonHang: string) {
    return await reviewModel
      .findOne({ maDonHang, hoatDong: true });
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
