import mongoose from 'mongoose';
import orderIngredientDetailModel, { OrderIngredientDetailInput } from '../models/orderIngredientDetailModel';
import orderIngredientModel from '../models/orderIngredientModel';
import ingredientModel from '../models/ingredientModel';
import { BadRequestError } from '../utils/errors';

class OrderIngredientDetailService {
  // Tạo mới chi tiết đơn đặt nguyên liệu
  async create(data: OrderIngredientDetailInput) {
    const { maDonDat, maNguyenLieu } = data;

    const ingredient = await ingredientModel.findById(maNguyenLieu);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }

    const order = await orderIngredientModel.findById(maDonDat);
    if (!order) {
      throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');
    }

    //Lấy số lượng từ đơn đặt
    const nguyenLieuItem = order.nguyenLieu.find(item => item.maNguyenLieu === maNguyenLieu);
    if (!nguyenLieuItem) {
      throw new BadRequestError('Không tìm thấy nguyên liệu này trong đơn đặt');
    }

    const soLuong = nguyenLieuItem.soLuong;

    // Lấy đơn giá từ nhà cung cấp phù hợp
    const giaTheoNCC = ingredient.nhaCungCap.find(
      ncc => ncc.maNhacungCap === order.maNhaCungCap.toString()
    );

    if (!giaTheoNCC) {
      throw new BadRequestError(
        `Không tìm thấy đơn giá cho nguyên liệu "${ingredient.ten}" từ nhà cung cấp đã chọn`
      );
    }

    const donGia = giaTheoNCC.donGia;
    const thanhTien = donGia * soLuong;

    const orderIngredientDetail = await orderIngredientDetailModel.create({
      maDonDat,
      maNguyenLieu,
      tenNguyenLieu: ingredient.ten,
      soLuong,
      donGia,
      thanhTien,
      donViTinh: ingredient.donViTinh,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

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
  async update(id: string, data: Partial<{ tenNguyenLieu: string; donViTinh: string }>) {
    const detail = await orderIngredientDetailModel.findById(id);
    if (!detail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }

    // Lấy lại dữ liệu gốc để tính lại thanhTien
    const ingredient = await ingredientModel.findById(detail.maNguyenLieu);
    const order = await orderIngredientModel.findById(detail.maDonDat);

    if (!ingredient || !order) {
      throw new BadRequestError('Không tìm thấy dữ liệu nguyên liệu hoặc đơn đặt');
    }

    const nguyenLieuItem = order.nguyenLieu.find(i => i.maNguyenLieu === detail.maNguyenLieu.toString());
    if (!nguyenLieuItem) {
      throw new BadRequestError('Không tìm thấy nguyên liệu này trong đơn đặt');
    }

    const soLuong = nguyenLieuItem.soLuong;
    const giaTheoNCC = ingredient.nhaCungCap.find(ncc => ncc.maNhacungCap === order.maNhaCungCap.toString());
    if (!giaTheoNCC) {
      throw new BadRequestError('Không tìm thấy đơn giá cho nguyên liệu từ nhà cung cấp đã chọn');
    }

    const donGia = giaTheoNCC.donGia;
    const thanhTien = soLuong * donGia;

    const updated = await orderIngredientDetailModel.findByIdAndUpdate(
      id,
      {
        ...data, // chỉ nên chứa các field nhẹ như `tenNguyenLieu`, `donViTinh` nếu cần chỉnh tay
        soLuong,
        donGia,
        thanhTien,
        ngayCapNhat: new Date(),
      },
      { new: true }
    );

    await this.calculateAndUpdateTongTien(detail.maDonDat);

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
