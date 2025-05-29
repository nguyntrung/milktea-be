import promotionModel, { PromotionInput } from '../models/promotionModel';
import { BadRequestError } from '../utils/errors';
import { LoaiKhuyenMai } from '../types/common';

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
  
  isValidForOrder(order: any, promo: any): boolean {
    const now = new Date();
    if (promo.thoiGianApDung.batDau > now || promo.thoiGianApDung.ketThuc < now) return false;

    if (promo.doiTuongKhuyenMai !== 'hoaDon') return false;

    if (order.tongTienHang < promo.hoaDonApDung.giaTriToiThieu) return false;

    if (promo.soLuong.daSuDung >= promo.soLuong.tongSoLuong) return false;

    return true;
  }

  async calculateDiscounts(khuyenMais: { loaiKhuyenMai: LoaiKhuyenMai; giaTri: number }[], tongTien: number) {
    let tongGiam = 0;

    for (const km of khuyenMais) {
      let giam = 0;
      if (km.loaiKhuyenMai === LoaiKhuyenMai.GIAM_PHAN_TRAM) {
        giam = (tongTien * km.giaTri) / 100;
      } else if (km.loaiKhuyenMai === LoaiKhuyenMai.GIAM_TIEN) {
        giam = km.giaTri;
      }
      tongGiam += giam;
    }

    return Math.min(tongGiam, tongTien);
  }
}

export default new PromotionService();
