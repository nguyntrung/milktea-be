import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  maKhachHang: string;
  maSanPham: string;
  ngayDanhGia: Date;
  diemDanhGia: number;
  noiDung: string;
  hinhAnh: string[];
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ReviewInput {
  maSanPham: string;
  iemDanhGia: number;
  noiDung: string;
  hinhAnh: string[];
}

const reviewSchema = new Schema<IReview>({
  maKhachHang: { type: String, ref: 'NguoiDung', required: true },
  maSanPham: { type: String, ref: 'SanPham', required: true },
  ngayDanhGia: { type: Date, default: Date.now },
  diemDanhGia: { type: Number, required: true, min: 1, max: 5 },
  noiDung: { type: String, required: true },
  hinhAnh: [{ type: String }],
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

reviewSchema.index({ maSanPham: 1 });
reviewSchema.index({ hoatDong: 1 });

export default mongoose.model<IReview>('DanhGia', reviewSchema);