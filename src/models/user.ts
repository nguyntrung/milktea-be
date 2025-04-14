import { Schema, model, Document } from 'mongoose';

interface INguoiDung extends Document {
  ho_ten: string;
  gioi_tinh: 'Nam' | 'Nữ' | 'Khác';
  email: string;
  mat_khau?: string;
  so_dien_thoai: string;
  dia_chi?: string;
  vai_tro?: 'admin' | 'nhan_vien' | 'khach_hang';
  xu_hien_tai?: number;
  ngay_tao?: Date;
  ngay_cap_nhat?: Date;
}

const nguoiDungSchema = new Schema<INguoiDung>(
  {
    ho_ten: { type: String, required: true },
    gioi_tinh: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: true },
    email: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      unique: true,
    },
    mat_khau: { type: String, minLength: 6 },
    so_dien_thoai: {
      type: String,
      required: true,
      match: /^[0-9]{10,11}$/,
    },
    dia_chi: { type: String },
    vai_tro: { type: String, enum: ['admin', 'nhan_vien', 'khach_hang'], default: 'khach_hang' },
    xu_hien_tai: { type: Number, min: 0, default: 0 },
    ngay_tao: { type: Date, default: Date.now },
    ngay_cap_nhat: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'ngay_tao', updatedAt: 'ngay_cap_nhat' } }
);

export const NguoiDung = model<INguoiDung>('nguoi_dung', nguoiDungSchema);
