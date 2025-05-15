import promotionModel, { IPromotion, PromotionInput } from '../models/promotionModel';
import { BadRequestError } from '../utils/errors';

class PromotionService {
  // Tạo khuyến mãi
  async create(data: PromotionInput) {
    const existing = await promotionModel.findOne({ maKhuyenMai: data.maKhuyenMai });
    if (existing) {
      throw new BadRequestError(`Mã khuyến mãi '${data.maKhuyenMai}' đã tồn tại`);
    }

    const promotion = new promotionModel({
      ...data,
      'soLuong.daSuDung': 0,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    await promotion.save();
    return promotion;
  }

  // Lấy tất cả khuyến mãi
  async getAll() {
    return await promotionModel.find();
  }

  // Lấy khuyến mãi theo ID
  async getById(id: string) {
    const promo = await promotionModel.findById(id);
    if (!promo) throw new BadRequestError('Không tìm thấy khuyến mãi');
    return promo;
  }

  // Cập nhật khuyến mãi
  async update(id: string, updateData: Partial<PromotionInput>) {
    const promo = await promotionModel.findById(id);
    if (!promo) throw new BadRequestError('Không tìm thấy khuyến mãi');

    const updated = await promotionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          ngayCapNhat: new Date(),
        },
      },
      { new: true }
    );

    return updated;
  }

  // Xóa khuyến mãi
  async delete(id: string) {
    const promo = await promotionModel.findById(id);
    if (!promo) throw new BadRequestError('Không tìm thấy khuyến mãi');

    await promotionModel.findByIdAndDelete(id);
    return { message: 'Xóa khuyến mãi thành công' };
  }
}

export default new PromotionService();
