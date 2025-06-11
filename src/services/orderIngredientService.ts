import mongoose from 'mongoose';
import orderIngredientModel, { OrderIngredientInput } from '../models/orderIngredientModel';
import ingredientModel from '../models/ingredientModel';
import orderIngredientDetailModel from '../models/orderIngredientDetailModel';
import orderIngredientDetailService from './orderIngredientDetailService';
import { TrangThaiDonDatNguyenLieu } from '../types/common';
import userModel from '../models/userModel';
import { BadRequestError } from '../utils/errors';

class orderIngredientService {
  async create(data: OrderIngredientInput) {
    const {
      maNhaCungCap,
      thoiGianCanGiao,
      nguyenLieu,
      ghiChu,
      nguoiDat
    } = data;

    const nhaCungCapId = new mongoose.Types.ObjectId(maNhaCungCap);
    const nguoiDatId = new mongoose.Types.ObjectId(nguoiDat);

    const user = await userModel.findById(nguoiDatId);
    if (!user) throw new BadRequestError('Người đặt không tồn tại');

    // Tạo đơn đặt nguyên liệu
    const order = await orderIngredientModel.create({
      maNhaCungCap: nhaCungCapId,
      ngayDat: new Date(),
      thoiGianCanGiao,
      nguyenLieu: nguyenLieu,
      trangThai: TrangThaiDonDatNguyenLieu.CHUA_NHAP,
      ghiChu,
      nguoiDat: { ma: user.id, ten: user.ten },
      nguoiNhap: null,
      ngayNhap: null,
      tongTien: 0,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    // Lấy danh sách nguyên liệu
    const ingredientDocs = await ingredientModel.find({
      _id: { $in: nguyenLieu.map(i => i.maNguyenLieu) }
    });

    // Tạo chi tiết nguyên liệu với số lượng từ client, đơn giá = 0
    for (const item of nguyenLieu) {
      const ing = ingredientDocs.find(i => i.id === item.maNguyenLieu);
      if (!ing) continue;

      await orderIngredientDetailModel.create({
        maDonDat: order._id,
        maNguyenLieu: ing._id,
        tenNguyenLieu: ing.ten,
        donViTinh: ing.donViTinh,
        soLuong: item.soLuong,
        donGia: 0,
        thanhTien: 0,
      });
    }

    // Tổng tiền vẫn = 0 cho đến khi cập nhật đơn giá
    await orderIngredientDetailService.calculateAndUpdateTongTien(order.id);

    // Lấy chi tiết để trả về
    const chiTiet = await orderIngredientDetailModel.find({ maDonDat: order._id });
    const nguyenLieuDetail = chiTiet.map(ct => ({
      maNguyenLieu: ct.maNguyenLieu.toString(),
      ten: ct.tenNguyenLieu,
      donViTinh: ct.donViTinh,
      soLuong: ct.soLuong,
      donGia: ct.donGia,
      thanhTien: ct.thanhTien,
    }));

    return {
      ...order.toObject(),
      nguyenLieu: nguyenLieuDetail,
    };
  }


  async getAll() {
    return await orderIngredientModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const order = await orderIngredientModel.findById(id);
    if (!order) throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');
    return order;
  }

  async update(id: string, data: any) {
    const order = await orderIngredientModel.findById(id);
    if (!order) throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');

    const isNhap = data.trangThai === TrangThaiDonDatNguyenLieu.DA_NHAN_HANG;
    const isHuy = data.trangThai === TrangThaiDonDatNguyenLieu.HUY_DON;

    let nguoiNhapObj = null;
    if (isNhap && data.nguoiNhap) {
      const userNhap = await userModel.findById(data.nguoiNhap);
      if (!userNhap) throw new BadRequestError('Người nhập không tồn tại');
      nguoiNhapObj = { ma: userNhap.id, ten: userNhap.ten };
    }

    const updatedOrder = await orderIngredientModel.findByIdAndUpdate(
      id,
      {
        ...data,
        nguoiNhap: nguoiNhapObj,
        ngayNhap: isNhap ? new Date() : null,
        ngayCapNhat: new Date(),
        ...(isHuy && {
          nguoiNhap: null,
          ngayNhap: null,
        }),
      },
      { new: true }
    );

    if (isNhap) {
      const chiTiet = await orderIngredientDetailModel.find({ maDonDat: id });

      for (const ct of chiTiet) {
        await ingredientModel.findByIdAndUpdate(
          ct.maNguyenLieu,
          { $inc: { soLuongNhap: ct.soLuong } }
        );
      }
    }

    await orderIngredientDetailService.calculateAndUpdateTongTien(updatedOrder!.id);

    const chiTiet = await orderIngredientDetailModel.find({ maDonDat: id });

    const nguyenLieuDetail = chiTiet.map(ct => ({
      maNguyenLieu: ct.maNguyenLieu.toString(),
      ten: ct.tenNguyenLieu,
      donViTinh: ct.donViTinh,
      soLuong: ct.soLuong,
      donGia: ct.donGia,
      thanhTien: ct.thanhTien,
    }));

    return {
      ...updatedOrder!.toObject(),
      nguyenLieu: nguyenLieuDetail,
    };
  }

  async delete(id: string) {
    const order = await orderIngredientModel.findById(id);
    if (!order) throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');

    await orderIngredientModel.findByIdAndDelete(id);
    return { message: 'Xóa đơn đặt nguyên liệu thành công' };
  }
}

export default new orderIngredientService();
