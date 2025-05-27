import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiPhanHoi } from '../types/common';

export interface IFeedback extends Document {
  _id: string;
  maKhachHang: string;
  tieuDe: string;
  noiDung: string;
  ngayPhanHoi: Date;
  ngayXuLy: Date;
  nguoiXuLy: string;
  trangThai: TrangThaiPhanHoi;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface FeedbackInput {
  tieuDe: string;
  noiDung: string;
}

const feedbackSchema = new Schema<IFeedback>({
  maKhachHang: { type: String, ref: 'NguoiDung', required: true },
  tieuDe: { type: String, required: true },
  noiDung: { type: String, required: true },
  ngayPhanHoi: { type: Date, default: Date.now },
  ngayXuLy: { type: Date },
  nguoiXuLy: { type: String },
  trangThai: {
    type: String,
    enum: Object.values(TrangThaiPhanHoi),
    default: TrangThaiPhanHoi.DANG_XU_LY
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now }
});

export default mongoose.model<IFeedback>('PhanHoi', feedbackSchema);