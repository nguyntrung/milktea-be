import mongoose, { Schema, Document } from 'mongoose';
import { LoaiThongBao, TrangThaiPhanHoi } from '../types/common';

export interface INotification extends Document {
  _id: string;  
  tieuDe: string;
  noiDung: string;
  loaiThongBao: LoaiThongBao;
  maNguoiNhan: string;
  lienKet?: string;
  trangThai: TrangThaiPhanHoi;
  daDoc: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface NotificationInput {
  tieuDe: string;
  noiDung: string;
  loaiThongBao: LoaiThongBao;
  maNguoiNhan: string;
  lienKet?: string;
  trangThai?: TrangThaiPhanHoi;
}

const notificationSchema = new Schema<INotification>({
  tieuDe: { type: String, required: true },
  noiDung: { type: String, required: true },
  loaiThongBao: {   
    type: String,
    enum: Object.values(LoaiThongBao),
    required: true,
  },
  maNguoiNhan: { type: String, ref: 'NguoiDung', required: true },
  lienKet: { type: String },
  trangThai: {
    type: String,
    enum: Object.values(TrangThaiPhanHoi),
    default: TrangThaiPhanHoi.CHUA_DOC,
  },
  daDoc: { type: Boolean, default: false },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

notificationSchema.index({ maNguoiNhan: 1, daDoc: 1 });
notificationSchema.index({ loaiThongBao: 1 });

export default mongoose.model<INotification>('ThongBao', notificationSchema);
