import mongoose, { Schema, Document } from 'mongoose';
import { PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan } from '../types/common';

export interface IOrder extends Document {
  maKhachHang: string;
  maNhanVien: string;
  ngayLap: Date;
  tongTienHang: number;
  // khuyenMai: {
  //   maKhuyenMai: string;
  //   giaTri: number;
  // }[];
  tongTien: number;
  nguoiGiao: string;
  thongTinNguoiNhan: string;
  thanhToan: {
    phuongThucThanhToan: PhuongThucThanhToan;
    trangThaiThanhToan: TrangThaiThanhToan;
  };
  lichSuTrangThai: {
    thoiGian: Date;
    trangThaiDonHang: TrangThaiDonHang;
  }[];
  ghiChu: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface OrderInput {
  maKhachHang: string;
  maNhanVien: string;
  // khuyenMai: {
  //   maKhuyenMai: string;
  //   giaTri: number;
  // }[];
  nguoiGiao: string;
  thongTinNguoiNhan: string;
  thanhToan: {
    phuongThucThanhToan: PhuongThucThanhToan;
    trangThaiThanhToan: TrangThaiThanhToan;
  };
  ghiChu?: string;
}

const orderSchema = new Schema<IOrder>({
  maKhachHang: { type: String, ref: 'NguoiDung', required: true },
  maNhanVien: { type: String, ref: 'NguoiDung', required: true },
  ngayLap: { type: Date, default: Date.now },
  tongTienHang: { type: Number, required: true },
  // khuyenMai: [{
  //   maKhuyenMai: { type: String, ref: 'KhuyenMai' },
  //   giaTri: { type: Number },
  // }],
  tongTien: { type: Number, required: true },
  nguoiGiao: { type: String, required: true },
  thongTinNguoiNhan: { type: String, required: true },
  thanhToan: {
    phuongThucThanhToan: { type: String, enum: Object.values(PhuongThucThanhToan), required: true },
    trangThaiThanhToan: { type: String, enum: Object.values(TrangThaiThanhToan), required: true },
  },
  lichSuTrangThai: [{
    thoiGian: { type: Date, default: Date.now },
    trangThaiDonHang: { type: String, enum: Object.values(TrangThaiDonHang), required: true },
  }],
  ghiChu: { type: String },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

orderSchema.index({ maKhachHang: 1 });
orderSchema.index({ 'trangThai.choXuLy': 1 });
orderSchema.index({ ngayTao: 1 });

export default mongoose.model<IOrder>('DonHang', orderSchema);