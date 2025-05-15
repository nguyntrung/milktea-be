import mongoose, { Schema, Document } from 'mongoose';
import { DoiTuongKhuyenMai, LoaiKhuyenMai } from '../types/common';

export interface IPromotion extends Document {
  _id: string;
  maKhuyenMai: string;
  tenKhuyenMai: string;
  moTa: string;
  thoiGianApDung: {
    batDau: Date;
    ketThuc: Date;
  }
  loaiKhuyenMai: LoaiKhuyenMai;
  doiTuongKhuyenMai: DoiTuongKhuyenMai;
  sanPhamApDung: string[];
  hoaDonApDung: {
    giaTriToiThieu: number;
    giaTriToiDa: number;
  }
  giaTri: number;
  soLuong: {
    tongSoLuong: number;
    daSuDung: number;
    gioiHanMoiNguoiDung: number;
  }
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface PromotionInput {
  maKhuyenMai: string;
  tenKhuyenMai: string;
  moTa: string;
  thoiGianApDung: {
    batDau: Date;
    ketThuc: Date;
  };
  loaiKhuyenMai: LoaiKhuyenMai;
  doiTuongKhuyenMai: DoiTuongKhuyenMai;
  sanPhamApDung: string[]; // Mảng mã sản phẩm
  hoaDonApDung: {
    giaTriToiThieu: number;
    giaTriToiDa: number;
  };
  giaTri: number;
  soLuong: {
    tongSoLuong: number;
    gioiHanMoiNguoiDung: number;
  };
}

const promotionSchema = new Schema<IPromotion>({
  maKhuyenMai: { type: String, required: true, unique: true },
  tenKhuyenMai: { type: String, required: true },
  moTa: { type: String },
  thoiGianApDung: {
    batDau: { type: Date, required: true },
    ketThuc: { type: Date, required: true },
  },
  loaiKhuyenMai: {
    type: String,
    enum: Object.values(LoaiKhuyenMai),
    required: true,
  },
  doiTuongKhuyenMai: {
    type: String,
    enum: Object.values(DoiTuongKhuyenMai),
    required: true,
  },
  sanPhamApDung: [{ type: String, ref: 'SanPham' }],
  hoaDonApDung: {
    giaTriToiThieu: { type: Number, default: 0 },
    giaTriToiDa: { type: Number, default: 0 },
  },
  giaTri: { type: Number, required: true },
  soLuong: {
    tongSoLuong: { type: Number, required: true },
    daSuDung: { type: Number, default: 0 },
    gioiHanMoiNguoiDung: { type: Number, default: 1 },
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

//promotionSchema.index({ maKhuyenMai: 1 });
promotionSchema.index({ 'thoiGianApDung.batDau': 1, 'thoiGianApDung.ketThuc': 1 });
promotionSchema.index({ loaiKhuyenMai: 1 });
promotionSchema.index({ doiTuongKhuyenMai: 1 });

export default mongoose.model<IPromotion>('KhuyenMai', promotionSchema);