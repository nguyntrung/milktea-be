import mongoose from 'mongoose';
import orderIngredientDetailModel, { OrderIngredientDetailInput } from '../models/orderIngredientDetailModel';
import orderIngredientModel from '../models/orderIngredientModel';
import ingredientModel from '../models/ingredientModel';
import { BadRequestError } from '../utils/errors';

class OrderIngredientDetailService {
  // Tạo mới chi tiết đơn đặt nguyên liệu
  async create(data: OrderIngredientDetailInput) {
    const { maDonDat, maNguyenLieu, soLuong, donGia } = data;

    // Tìm nguyên liệu theo mã để lấy donViTinh
    const ingredient = await ingredientModel.findOne({ _id: maNguyenLieu });
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }

    const thanhTien = donGia * soLuong; // Tính thanh tiền mặc định

    const orderIngredientDetail = await orderIngredientDetailModel.create({
      maDonDat,
      maNguyenLieu,
      tenNguyenLieu: ingredient.ten,
      soLuong,
      donGia,
      thanhTien: thanhTien,
      donViTinh: ingredient.donViTinh,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    // Sau khi tạo chi tiết => tính lại tổng tiền
    await this.calculateAndUpdateTongTien(maDonDat);

    return orderIngredientDetail;
  }

   // Tạo nhiều chi tiết đơn đặt nguyên liệu
    async createMany(data: OrderIngredientDetailInput[]) {
      const results = [];
      for (const item of data) {
        const created = await this.create(item);
        results.push(created);
      }
      return results;
    }

    // Tính lại tổng tiền đơn đặt
    async calculateAndUpdateTongTien(maDonDat: string) {
      const details = await orderIngredientDetailModel.find({ maDonDat });

      const tongTien = details.reduce((sum, d) => sum + d.thanhTien, 0);

      await orderIngredientModel.findByIdAndUpdate(
        maDonDat,
        { tongTien, ngayCapNhat: new Date() },
        { new: true }
      );
    }
    
  // Lấy tất cả chi tiết đơn đặt nguyên liệu
  async getAll() {
    return await orderIngredientDetailModel.find().sort({ ngayTao: -1 });
  }

  // Lấy chi tiết đơn đặt nguyên liệu theo ID
  async getById(id: string) {
    const orderIngredientDetail = await orderIngredientDetailModel.findById(id);
    if (!orderIngredientDetail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }
    return orderIngredientDetail;
  }

  // Cập nhật chi tiết đơn đặt nguyên liệu
  async update(id: string, data: any) {
    const orderIngredientDetail = await orderIngredientDetailModel.findById(id);
    if (!orderIngredientDetail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }

    const thanhTien = data.donGia * data.soLuong;

    const updated = await orderIngredientDetailModel.findByIdAndUpdate(
      id,
      {
        ...data,
        thanhTien,
        ngayCapNhat: new Date(),
      },
      { new: true }
    );

    // Sau khi cập nhật => cập nhật tổng tiền đơn đặt
    await this.calculateAndUpdateTongTien(orderIngredientDetail.maDonDat);

    return updated;
  }

  // Xóa chi tiết
  async delete(id: string) {
    const detail = await orderIngredientDetailModel.findById(id);
    if (!detail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }

    await orderIngredientDetailModel.findByIdAndDelete(id);

    // Sau khi xóa => cập nhật tổng tiền
    await this.calculateAndUpdateTongTien(detail.maDonDat);

    return { message: 'Xóa chi tiết đơn đặt nguyên liệu thành công' };
  }
}

export default new OrderIngredientDetailService();
